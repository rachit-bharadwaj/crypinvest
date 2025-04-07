import { Request, Response } from "express";
import mongoose from "mongoose";
import connectDB from "../database/connection/mongoose";
import User from "../database/models/User";
import axios from "axios";
import Referral from "../database/models/Referral";

export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    // Fetch all users
    const users = await User.find({});

    // Calculate total users
    const totalUsers = users.length;

    // Get the current date and calculate the date one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count the number of users created in the last week
    const usersLastWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo },
    });

    // Calculate growth percentage
    const growth =
      totalUsers === 0 ? 0 : ((usersLastWeek / totalUsers) * 100).toFixed(2);

    // Return the response
    res.status(200).json({
      success: true,
      users,
      totalUsers,
      growth: parseFloat(growth.toString()), // Return as a number
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * Get user details by ID
 */
export const getUserDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await User.findById(userId)
      .populate("investments")
      .populate("referral.referrals");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!user.referral.referralCode) {
      user.referral.referralCode = Math.random()
        .toString(16)
        .substring(2, 8)
        .toUpperCase();
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get user details by wallet address
 */
export const getUserDetailsByWallet = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const { walletAddress } = req.params;

    if (!walletAddress) {
      res.status(400).json({ error: "Wallet address is required" });
      return;
    }

    // Find user and populate referrals
    const user = await User.findOne({ walletAddress })
      .populate({
        path: "referral.referrals", // Populate referral details
        select: "commission status", // Only select fields you need
      })
      .populate("investments");

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Dynamically calculate totalCommission (for extra safety)
    const validReferrals = (user.referral?.referrals || []).filter(
      (ref: any) => ref
    );

    const totalCommission = validReferrals.reduce(
      (sum: number, referral: any) => sum + (referral?.commission || 0),
      0
    );

    user.referral.totalCommission = totalCommission;
    await user.save();

    if (!user.referral.referralCode) {
      user.referral.referralCode = Math.random()
        .toString(16)
        .substring(2, 8)
        .toUpperCase();
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details by wallet:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Create a user from the admin panel
 */
export const createUserFromAdmin = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const {
      fullName,
      username,
      email,
      phone,
      gender,
      country,
      address,
      walletAddress,
    } = req.body;

    if (
      !fullName ||
      !username ||
      !email ||
      !phone ||
      !gender ||
      !country ||
      !walletAddress
    ) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      res
        .status(400)
        .json({ error: "User with this wallet address already exists" });
      return;
    }

    const newUser = new User({
      fullName,
      username,
      email,
      phone,
      gender,
      country,
      address,
      walletAddress,
      referral: {
        referralCode: Math.random().toString(16).substring(2, 8).toUpperCase(),
      },
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error creating user from admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Upload or edit documents from user dashboard
 */
export const uploadOrEditDocuments = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const userId = req.params.id;
    const { documentType, documentPath } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (
      ![
        "residenceProof",
        "bankStatement",
        "proofOfIncome",
        "passport",
        "livePhoto",
      ].includes(documentType)
    ) {
      res.status(400).json({ error: "Invalid document type" });
      return;
    }

    user.documents[documentType] = {
      doc: documentPath,
      verifiedStatus: "Pending",
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: "Document updated successfully",
      documents: user.documents,
    });
  } catch (error) {
    console.error("Error uploading or editing documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Verify documents from the admin panel
 */
export const verifyDocument = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const userId = req.params.id;
    const { documentType, verifiedStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (!["Verified", "Rejected", "Pending"].includes(verifiedStatus)) {
      res.status(400).json({ error: "Invalid verification status" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (
      ![
        "residenceProof",
        "bankStatement",
        "proofOfIncome",
        "passport",
        "livePhoto",
      ].includes(documentType)
    ) {
      res.status(400).json({ error: "Invalid document type" });
      return;
    }

    if (!user.documents[documentType]) {
      res.status(400).json({ error: "Document does not exist for this type" });
      return;
    }

    user.documents[documentType].verifiedStatus = verifiedStatus;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Document verification updated successfully",
      documents: user.documents,
    });
  } catch (error) {
    console.error("Error verifying documents:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Edit user profile information
 */
export const editProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  await connectDB();
  try {
    const userId = req.params.id;
    const {
      fullName,
      username,
      email,
      phone,
      gender,
      country,
      address,
      profilePicture,
      avatar,
    } = req.body;

    console.log("Incoming Request Data:", req.body);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Update user fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (gender) user.gender = gender;
    if (country) user.country = country;
    if (address) user.address = address;
    if (profilePicture) user.profilePicture = profilePicture;
    if (avatar) {
      console.log("Updating avatar:", avatar);
      user.avatar = avatar;
    }

    await user.save();

    const updatedUser = await User.findById(userId);
    console.log("After saving, updated avatar:", updatedUser.avatar);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error editing profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const fetchNFTs = async (req: Request, res: Response): Promise<any> => {
  const { walletAddress } = req.params;

  try {
    // Auto-detect network based on address format
    const network = await detectNetworkFromAddress(walletAddress);

    let nfts: any[] = [];

    switch (network) {
      case "ethereum":
        nfts = await fetchEthereumNFTs(walletAddress);
        break;
      case "solana":
        nfts = await fetchSolanaNFTs(walletAddress);
        break;
      default:
        return res.status(400).json({ error: "Unsupported network" });
    }

    return res.status(200).json({ nfts });
  } catch (error: any) {
    console.error("NFT Fetch Error:", error);
    return res.status(500).json({
      error: "Failed to fetch NFTs",
      details: error.response?.data || error.message,
    });
  }
};

// Network Detection Helper
const detectNetworkFromAddress = async (address: string): Promise<string> => {
  const bs58 = await import("bs58").then((m) => m.default);

  // Ethereum: 0x prefix + 40 hex chars
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ethereum";

  // Solana: Base58 encoded 32-byte public key (44 chars)
  try {
    if (bs58.decode(address).length === 32) return "solana";
  } catch (e) {}

  return "unknown";
};

// Ethereum NFT Fetching (Alchemy)
const fetchEthereumNFTs = async (address: string) => {
  const apiKey = process.env.ALCHEMY_API_KEY;
  const response = await axios.get(
    `https://eth-mainnet.g.alchemy.com/nft/v2/${apiKey}/getNFTs`,
    { params: { owner: address, withMetadata: true } }
  );

  return response.data.ownedNfts.map((nft: any) => ({
    name: nft.title || "Unnamed NFT",
    image: nft.media[0]?.gateway || "",
    contract: nft.contract.address,
    tokenId: nft.id.tokenId,
    network: "ethereum",
  }));
};

// Solana NFT Fetching (Helius)
const fetchSolanaNFTs = async (address: string) => {
  const apiKey = process.env.HELIUS_API_KEY; // Get from helius.xyz
  const response = await axios.post(
    `https://rpc.helius.xyz/?api-key=${apiKey}`,
    {
      jsonrpc: "2.0",
      id: "1",
      method: "getAssetsByOwner",
      params: {
        ownerAddress: address,
        page: 1,
        limit: 1000,
      },
    }
  );

  return response.data.result.items.map((nft: any) => ({
    name: nft.content.metadata.name || "Unnamed NFT",
    image: nft.content.links.image || "",
    contract: nft.id,
    tokenId: nft.id,
    network: "solana",
  }));
};
