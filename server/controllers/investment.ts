import { Request, Response } from "express";
import User from "../database/models/User";
import Pool from "../database/models/Pool";
import Investment from "../database/models/Investment";
import connectDB from "../database/connection/mongoose";

// Create a new investment
export const createInvestment = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { walletAddress, planName, amount, status, transactionId } = req.body;

  if (!walletAddress || !planName || !amount || !status || !transactionId) {
    return res
      .status(400)
      .json({ error: "Missing required fields", receivedPayload: req.body });
  }

  try {
    // Find the user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the pool
    const pool = await Pool.findOne({ name: planName });
    if (!pool) {
      return res.status(404).json({ error: "Pool not found" });
    }

    // Create investment
    const investment = await Investment.create({
      user: user._id,
      pool: pool._id,
      amount,
      status,
      transactionId,
    });

    // Update the user's investments and capital
    user.investments.push(investment._id);
    user.capital += amount;
    await user.save();

    // Update the pool's investments
    pool.investments.push(investment._id);
    await pool.save();

    return res.status(201).json({ success: true, investment });
  } catch (error) {
    console.error("Error creating investment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get total investments for a user by wallet address
export const getTotalInvestmentsByUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    // Find the user by wallet address
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find all investments for the user
    const investments = await Investment.find({ user: user._id });
    const totalAmount = investments.reduce(
      (sum, investment) => sum + investment.amount,
      0
    );

    return res.status(200).json({
      success: true,
      totalInvestments: totalAmount,
      investments,
    });
  } catch (error) {
    console.error("Error fetching total investments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getInvestmentsByPeriod = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { period } = req.query; // period can be 'daily', 'weekly', or 'monthly'

  try {
    let groupByFormat;

    switch (period) {
      case "daily":
        groupByFormat = {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        };
        break;
      case "weekly":
        groupByFormat = { $isoWeek: "$createdAt" }; // ISO week for weekly grouping
        break;
      case "monthly":
        groupByFormat = {
          $dateToString: { format: "%Y-%m", date: "$createdAt" },
        };
        break;
      default:
        return res.status(400).json({ error: "Invalid period specified." });
    }

    const investments = await Investment.aggregate([
      {
        $group: {
          _id: groupByFormat,
          totalAmount: { $sum: "$amount" }, // Sum up the amounts
          count: { $sum: 1 }, // Count the number of investments
        },
      },
      { $sort: { _id: 1 } }, // Sort by the period
    ]);

    res.status(200).json({ success: true, investments });
  } catch (error) {
    console.error("Error fetching investments by period:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all investments
export const getInvestments = async (
  _req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch all investments
    const investments = await Investment.find()
      .populate("user", "fullName walletAddress") // Populate user details
      .populate("pool", "name"); // Populate pool name

    // Total investments
    const totalInvestments = investments.length;

    // Investments made in the last 7 days
    const recentInvestments = await Investment.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Calculate growth percentage
    const growth =
      totalInvestments > 0
        ? ((recentInvestments.length / totalInvestments) * 100).toFixed(2)
        : "0";

    return res.status(200).json({
      success: true,
      investments,
      totalInvestments,
      growth,
    });
  } catch (error) {
    console.error("Error fetching investments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single investment by ID
export const getInvestmentById = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;

  try {
    const investment = await Investment.findById(id)
      .populate("user", "walletAddress fullName email")
      .populate("pool", "name minimumDeposit annualROI");

    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    return res.status(200).json({ success: true, investment });
  } catch (error) {
    console.error("Error fetching investment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update an investment
export const updateInvestment = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;
  const updateData = req.body;

  try {
    const investment = await Investment.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("user", "walletAddress fullName email")
      .populate("pool", "name minimumDeposit annualROI");

    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    return res.status(200).json({ success: true, investment });
  } catch (error) {
    console.error("Error updating investment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an investment
export const deleteInvestment = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;

  try {
    const investment = await Investment.findByIdAndDelete(id);

    if (!investment) {
      return res.status(404).json({ error: "Investment not found" });
    }

    // Remove the investment reference from the user and pool
    await User.findByIdAndUpdate(investment.user, {
      $pull: { investments: investment._id },
      $inc: { capital: -investment.amount },
    });

    await Pool.findByIdAndUpdate(investment.pool, {
      $pull: { investments: investment._id },
    });

    return res
      .status(200)
      .json({ success: true, message: "Investment deleted successfully" });
  } catch (error) {
    console.error("Error deleting investment:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
