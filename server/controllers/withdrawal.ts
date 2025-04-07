import { Request, Response } from "express";
import mongoose from "mongoose";
import Withdrawal from "../database/models/Withdrawal";
import User from "../database/models/User";
import connectDB from "../database/connection/mongoose";

// Create a new withdrawal
export const createWithdrawal = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { walletAddress, amount }: { walletAddress: string; amount: number } =
    req.body;

  if (!walletAddress || !amount) {
    return res
      .status(400)
      .json({ error: "Missing required fields", receivedPayload: req.body });
  }

  try {
    // Find the user by wallet address
    const existingUser = await User.findOne({ walletAddress });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Create the withdrawal
    const withdrawal = await Withdrawal.create({
      user: existingUser._id,
      amount,
    });

    return res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getWithdrawalsByWalletAddress = async (
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

    // Fetch withdrawals for the user
    const withdrawals = await Withdrawal.find({ user: user._id }).sort({
      createdAt: -1,
    });

    return res.status(200).json({ success: true, withdrawals });
  } catch (error) {
    console.error("Error fetching withdrawals by wallet address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get all withdrawals
export const getAllWithdrawals = async (
  _req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch all withdrawals
    const withdrawals = await Withdrawal.find()
      .populate("user", "fullName email") // Populate user details
      .sort({ createdAt: -1 }); // Sort by most recent

    // Fetch pending withdrawals
    const pendingWithdrawals = await Withdrawal.find({ status: "Pending" });

    // Fetch withdrawals in the last 7 days
    const recentWithdrawals = await Withdrawal.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Calculate growth percentage
    const growth =
      withdrawals.length > 0
        ? ((recentWithdrawals.length / withdrawals.length) * 100).toFixed(2)
        : "0";

    return res.status(200).json({
      success: true,
      withdrawals,
      pendingWithdrawalsCount: pendingWithdrawals.length,
      growth,
    });
  } catch (error) {
    console.error("Error fetching withdrawals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get a single withdrawal by ID
export const getWithdrawalById = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid withdrawal ID" });
  }

  try {
    const withdrawal = await Withdrawal.findById(id).populate(
      "user",
      "fullName email"
    );

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    return res.status(200).json({ success: true, withdrawal });
  } catch (error) {
    console.error("Error fetching withdrawal by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update a withdrawal
export const updateWithdrawal = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;
  const { status }: { status?: string } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid withdrawal ID" });
  }

  if (!status) {
    return res.status(400).json({ error: "Status is required for update" });
  }

  try {
    // Find the withdrawal document
    const withdrawal = await Withdrawal.findById(id);

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    // Check if updating status to 'Completed'
    if (status === "Completed") {
      // Proceed only if the current status is not 'Completed'
      if (withdrawal.status !== "Completed") {
        const user = await User.findById(withdrawal.user);

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        console.log(user.capital);
        // Deduct the withdrawal amount from the user's capital
        user.capital -= withdrawal.amount;
        const updatedUser = await user.save();
        console.log(updatedUser);
        console.log(user.capital);

        // Set the approvedDate to current time
        withdrawal.approvedDate = new Date();
      }
    }

    // Update the withdrawal status
    withdrawal.status = status;
    await withdrawal.save();

    // Populate user details for the response
    const updatedWithdrawal = await Withdrawal.findById(id).populate(
      "user",
      "fullName email"
    );

    return res
      .status(200)
      .json({ success: true, withdrawal: updatedWithdrawal });
  } catch (error) {
    console.error("Error updating withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a withdrawal
export const deleteWithdrawal = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid withdrawal ID" });
  }

  try {
    const withdrawal = await Withdrawal.findByIdAndDelete(id);

    if (!withdrawal) {
      return res.status(404).json({ error: "Withdrawal not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Withdrawal deleted successfully" });
  } catch (error) {
    console.error("Error deleting withdrawal:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
