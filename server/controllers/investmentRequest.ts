import { Request, Response } from "express";
import connectDB from "../database/connection/mongoose";
import InvestmentRequest from "../database/models/InvestmentRequest";
import User from "../database/models/User";
import Pool from "../database/models/Pool";

// Create a new investment request
export const createInvestmentRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const { pool, user, status } = req.body;

    // Validate required fields
    if (!pool || !user) {
      return res
        .status(400)
        .json({ error: "Pool and User are required fields." });
    }

    // Create the investment request
    const investmentRequest = await InvestmentRequest.create({
      pool,
      user,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Investment request created successfully.",
      investmentRequest,
    });
  } catch (error) {
    console.error("Error creating investment request:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const createInvestmentRequestByWalletAndPoolname = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    await connectDB();
    try {
      const { walletAddress, poolName } = req.body;
  
      // Validate input
      if (!walletAddress || !poolName) {
        return res
          .status(400)
          .json({ error: "Wallet address and pool name are required." });
      }
  
      // Fetch the user by wallet address
      const user = await User.findOne({ walletAddress });
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      // Fetch the pool by name
      const pool = await Pool.findOne({ name: poolName });
      if (!pool) {
        return res.status(404).json({ error: "Pool not found." });
      }
  
      // Check if there is already a pending request for the same pool and user
      const existingRequest = await InvestmentRequest.findOne({
        user: user._id,
        pool: pool._id,
        status: "Pending",
      });
  
      if (existingRequest) {
        return res
          .status(400)
          .json({ error: "You already have a pending request for this pool." });
      }
  
      // Create the investment request
      const investmentRequest = new InvestmentRequest({
        user: user._id,
        pool: pool._id,
      });
  
      // Save the investment request
      const savedRequest = await investmentRequest.save();
  
      res.status(201).json({
        message: "Investment request created successfully.",
        investmentRequest: savedRequest,
      });
    } catch (error) {
      console.error("Error creating investment request:", error);
      res.status(500).json({ error: "Internal server error." });
    }
  };
  

// Get all investment requests
export const getAllInvestmentRequests = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const investmentRequests = await InvestmentRequest.find()
      .populate("pool", "name") // Populate pool details (e.g., pool name)
      .populate("user", "fullName email"); // Populate user details

    return res.status(200).json({
      success: true,
      investmentRequests,
    });
  } catch (error) {
    console.error("Error fetching investment requests:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Get a single investment request by ID
export const getInvestmentRequestById = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const { id } = req.params;

    const investmentRequest = await InvestmentRequest.findById(id)
      .populate("pool", "name")
      .populate("user", "fullName email");

    if (!investmentRequest) {
      return res.status(404).json({ error: "Investment request not found." });
    }

    return res.status(200).json({
      success: true,
      investmentRequest,
    });
  } catch (error) {
    console.error("Error fetching investment request:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Update an investment request
export const updateInvestmentRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedRequest = await InvestmentRequest.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
      }
    );

    if (!updatedRequest) {
      return res.status(404).json({ error: "Investment request not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Investment request updated successfully.",
      updatedRequest,
    });
  } catch (error) {
    console.error("Error updating investment request:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};

// Delete an investment request
export const deleteInvestmentRequest = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const { id } = req.params;

    const deletedRequest = await InvestmentRequest.findByIdAndDelete(id);

    if (!deletedRequest) {
      return res.status(404).json({ error: "Investment request not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Investment request deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting investment request:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
};
