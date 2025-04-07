import { Request, Response } from "express";
import connectDB from "../database/connection/mongoose"; // Import your DB connection function
import Referral from "../database/models/Referral";
import User from "../database/models/User"; // Ensure User model is imported

// Check if referral code exists in Users collection
export const checkReferralCode = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { referralCode } = req.body;

  if (!referralCode) {
    return res.status(400).json({ error: "Referral code is required." });
  }

  try {
    const user = await User.findOne({ "referral.referralCode": referralCode });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Referral code not found." });
    }

    res.status(200).json({
      success: true,
      message: "Referral code is valid.",
      referrer: user,
    });
  } catch (error) {
    console.error("Error checking referral code:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create a new referral
export const createReferral = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { referrer, referee, referralCode } = req.body;

  if (!referrer || !referee || !referralCode) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existingReferral = await Referral.findOne({ referee });

    if (existingReferral) {
      return res
        .status(400)
        .json({ error: "Referee has already been referred." });
    }

    // Get parent referral (if exists)
    const parentReferral = await Referral.findOne({ referee: referrer });

    const level = parentReferral ? parentReferral.level + 1 : 1;
    const ancestors = parentReferral
      ? [...parentReferral.ancestors, parentReferral._id]
      : [];

    const referral = await Referral.create({
      referrer,
      referee,
      referralCode,
      level,
      ancestors,
    });

    await User.findByIdAndUpdate(referrer, {
      $push: { "referral.referrals": referral._id },
    });

    res.status(201).json({ success: true, referral });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create referral by wallet address
export const createReferralByWallet = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { referralCode, walletAddress } = req.body;

  if (!referralCode || !walletAddress) {
    return res
      .status(400)
      .json({ error: "Referral code and wallet address are required." });
  }

  try {
    const referee = await User.findOne({ walletAddress });

    if (!referee) {
      return res.status(404).json({ error: "Referee not found." });
    }

    const referrer = await User.findOne({
      "referral.referralCode": referralCode,
    });

    if (!referrer) {
      return res.status(404).json({ error: "Referrer not found." });
    }

    if (referee._id.toString() === referrer._id.toString()) {
      return res
        .status(400)
        .json({ error: "Referrer and referee cannot be the same user." });
    }

    const existingReferral = await Referral.findOne({ referee: referee._id });

    if (existingReferral) {
      return res
        .status(400)
        .json({ error: "Referee has already been referred." });
    }

    // Retrieve the parent's referral data to maintain hierarchy
    const parentReferral = await Referral.findOne({ referee: referrer._id });

    const level = parentReferral ? parentReferral.level + 1 : 1;
    const ancestors = parentReferral
      ? [...parentReferral.ancestors, parentReferral._id]
      : [];

    const newReferral = await Referral.create({
      referrer: referrer._id,
      referee: referee._id,
      referralCode,
      level,
      ancestors, // Maintain hierarchical history
    });

    await User.findByIdAndUpdate(referrer._id, {
      $push: { "referral.referrals": newReferral._id },
    });

    res.status(201).json({ success: true, referral: newReferral });
  } catch (error) {
    console.error("Error creating referral:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all referrals
export const getAllReferrals = async (
  _req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Fetch all referrals
    const referrals = await Referral.find()
      .populate("referrer", "fullName email") // Populate referrer details
      .populate("referee", "fullName email") // Populate referee details
      .sort({ createdAt: -1 });

    // Calculate total referrals
    const totalReferrals = referrals.length;

    // Fetch referrals created in the last 7 days
    const recentReferrals = await Referral.find({
      createdAt: { $gte: sevenDaysAgo },
    });

    // Calculate growth percentage
    const growth =
      totalReferrals > 0
        ? ((recentReferrals.length / totalReferrals) * 100).toFixed(2)
        : "0";

    res.status(200).json({
      success: true,
      referrals,
      totalReferrals,
      growth,
    });
  } catch (error: any) {
    console.error("Error fetching referrals:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get referrals for a specific user
export const getReferralsByUser = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }

  try {
    const referrals = await Referral.find({ referrer: userId })
      .populate("referee", "fullName email") // Populate referee details
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, referrals });
  } catch (error: any) {
    console.error("Error fetching referrals by user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get referral information by wallet address
export const getReferralsByWalletAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { walletAddress } = req.params;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }

  try {
    // Fetch the user by wallet address
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    console.log("Found user:", user);

    // Fetch referrals associated with the user's ObjectId
    const referrals = await Referral.find({ referrer: user._id })
      .populate("referee", "fullName email")
      .sort({ createdAt: -1 });

    if (!referrals) {
      console.log("no referrals");
      return res.status(200).json({
        success: false,
        message: "No referrals yet",
      });
    }

    res.status(200).json({
      success: true,
      referralCode: user.referralCode, // Assuming `referralCode` exists on the User model
      referrals,
    });
  } catch (error) {
    console.error("Error fetching referrals by wallet address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a referral
export const deleteReferral = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;

  try {
    const referral = await Referral.findByIdAndDelete(id);

    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    res.status(200).json({ success: true, message: "Referral deleted." });
  } catch (error: any) {
    console.error("Error deleting referral:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update referral status
export const updateReferral = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;
  const { status, commission } = req.body;

  if (!status) {
    return res.status(400).json({ error: "Status is required." });
  }

  if (commission !== undefined && commission < 0) {
    return res.status(400).json({ error: "Commission cannot be negative." });
  }

  try {
    const referral = await Referral.findById(id)
      .populate("referrer", "fullName email")
      .populate("referee", "fullName email");

    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    // Check if the status is changed to "Completed" and trigger hierarchical commission updates
    if (status === "Completed" && referral.status !== "Completed") {
      await distributeCommissions(
        referral.referee.toString(),
        referral.commission
      );
    }

    referral.status = status;
    if (commission !== undefined) referral.commission = commission;

    await referral.save();

    res.status(200).json({
      success: true,
      message: "Referral updated successfully.",
      referral,
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const partialUpdateReferral = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { id } = req.params;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: "Referral ID is required." });
  }

  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No fields provided for update." });
  }

  if (updates.commission !== undefined && updates.commission < 0) {
    return res.status(400).json({ error: "Commission cannot be negative." });
  }

  try {
    const referral = await Referral.findById(id)
      .populate("referrer", "fullName email")
      .populate("referee", "fullName email");

    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    // If status is being updated to "Completed," trigger hierarchical commission updates
    if (updates.status === "Completed" && referral.status !== "Completed") {
      await distributeCommissions(
        referral.referee.toString(),
        referral.commission
      );
    }

    // Apply updates dynamically
    Object.keys(updates).forEach((key) => {
      referral[key] = updates[key];
    });

    await referral.save();

    res.status(200).json({
      success: true,
      message: "Referral updated successfully.",
      referral,
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update referral and handle commission
export const updateReferralByWalletAddress = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { walletAddress, investmentAmount } = req.body;

  if (!walletAddress || !investmentAmount) {
    return res
      .status(400)
      .json({ error: "Wallet address and investment amount are required." });
  }

  try {
    const referee = await User.findOne({ walletAddress });
    if (!referee) {
      return res.status(404).json({ error: "Referee not found." });
    }

    await distributeCommissions(referee._id.toString(), investmentAmount);

    res.status(200).json({
      success: true,
      message: "Commissions distributed successfully.",
    });
  } catch (error) {
    console.error("Error updating referral:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Utility function to distribute commissions in a multi-level system
const distributeCommissions = async (
  refereeId: string,
  investmentAmount: number
) => {
  let currentReferee = refereeId;
  let commissionPercentage = 0.1; // 10% for level 1

  while (currentReferee && commissionPercentage > 0.0001) {
    const referral = await Referral.findOne({
      referee: currentReferee,
    }).populate("referrer");

    if (!referral) break;

    const commission = parseFloat(
      (investmentAmount * commissionPercentage).toFixed(2)
    );

    referral.commissionEarned += commission;
    referral.status = "Pending";
    await referral.save();

    // Move to the next level (reduce commission by 10%)
    currentReferee = referral.referrer?._id || null;
    commissionPercentage *= 0.1;
  }
};

// Helper to build the upward ancestors chain for a given user
export const buildAncestors = async (userId: string): Promise<any[]> => {
  // Find the referral record where this user was referred
  const referralRecord = await Referral.findOne({ referee: userId })
    .populate({
      path: "ancestors",
      populate: { path: "referrer", select: "fullName email" }
    })
    .populate("referrer", "fullName email");
    
  if (!referralRecord) return [];
  
  const ancestorsChain = [];
  
  // Add all ancestors from the referral record's ancestors array.
  if (referralRecord.ancestors && referralRecord.ancestors.length > 0) {
    for (const ancestorReferral of referralRecord.ancestors) {
      if (ancestorReferral && ancestorReferral.referrer) {
        ancestorsChain.push({
          id: ancestorReferral.referrer._id,
          fullName: ancestorReferral.referrer.fullName,
          email: ancestorReferral.referrer.email,
        });
      }
    }
  }
  
  // Add the immediate referrer from the referral record itself.
  if (referralRecord.referrer) {
    ancestorsChain.push({
      id: referralRecord.referrer._id,
      fullName: referralRecord.referrer.fullName,
      email: referralRecord.referrer.email,
    });
  }
  
  return ancestorsChain;
};

// Helper to build the downward (descendants) referral tree for a given user
export const buildReferralTreeDownward = async (userId: string): Promise<any[]> => {
  const referrals = await Referral.find({ referrer: userId }).populate(
    "referee",
    "fullName email"
  );
  
  const children = await Promise.all(
    referrals.map(async (referral) => {
      if (!referral.referee) {
        console.warn(`Referral ${referral._id} has a missing referee. Skipping.`);
        return null;
      }
      return {
        id: referral.referee._id,
        fullName: referral.referee.fullName,
        email: referral.referee.email,
        level: referral.level || 1,
        commission: referral.commission || 0,
        referrals: await buildReferralTreeDownward(referral.referee._id),
      };
    })
  );
  
  return children.filter(child => child !== null);
};

// Build the full referral tree with both ancestors and descendants
export const buildFullReferralTree = async (userId: string): Promise<any> => {
  const user = await User.findById(userId, "fullName email");
  if (!user) return null;
  
  const ancestors = await buildAncestors(userId);
  const descendants = await buildReferralTreeDownward(userId);
  
  return {
    user: {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
    },
    ancestors,    // Upward chain (parent nodes)
    descendants,  // Downward tree (children nodes)
  };
};



export const getReferralTreeByWalletAddress = async (req: Request, res: Response): Promise<any> => {
  await connectDB();
  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }
  
  try {
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Build full tree (ancestors + descendants)
    const referralTree = await buildFullReferralTree(user._id.toString());
    res.status(200).json({
      success: true,
      referralTree,
    });
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getReferralTreeByUserId = async (req: Request, res: Response): Promise<any> => {
  await connectDB();
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required." });
  }
  
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Build full tree (ancestors + descendants)
    const referralTree = await buildFullReferralTree(user._id.toString());
    res.status(200).json({
      success: true,
      referralTree,
    });
  } catch (error) {
    console.error("Error fetching referral tree:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateReferralTree = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  const { referralId, newParentReferralId } = req.body;

  if (!referralId || !newParentReferralId) {
    return res
      .status(400)
      .json({ error: "Referral ID and new parent referral ID are required." });
  }

  try {
    const referral = await Referral.findById(referralId);
    const parentReferral = await Referral.findById(newParentReferralId);

    if (!referral) {
      return res.status(404).json({ error: "Referral not found." });
    }

    if (!parentReferral) {
      return res.status(404).json({ error: "New parent referral not found." });
    }

    // Recalculate the level and ancestors based on the new parent referral
    referral.level = parentReferral.level + 1;
    referral.ancestors = [...parentReferral.ancestors, parentReferral._id];

    await referral.save();

    res
      .status(200)
      .json({ success: true, message: "Referral tree updated.", referral });
  } catch (error) {
    console.error("Error updating referral tree:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
