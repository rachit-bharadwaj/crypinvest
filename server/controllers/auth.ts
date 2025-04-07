import NonceStore from "../database/models/NonceStore";
import { Request, Response } from "express";
import connectDB from "../database/connection/mongoose";
import User from "../database/models/User";
import { verifySignature } from "../utils/auth";

const generateNonce = async (req: Request, res: Response): Promise<any> => {
  const { walletAddress } = req.body;

  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required" });
  }

  try {
    await connectDB();

    const nonce = Math.random().toString(36).substring(2); // Generate a random nonce
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Set expiration to 5 minutes

    // Check if the wallet already has a nonce
    const existingNonce = await NonceStore.findOne({ walletAddress });

    if (existingNonce) {
      // Update the existing nonce
      existingNonce.nonce = nonce;
      existingNonce.expiresAt = expiresAt;
      await existingNonce.save();
    } else {
      // Create a new nonce record
      await NonceStore.create({ walletAddress, nonce, expiresAt });
    }

    res.status(200).json({ success: true, nonce });
  } catch (error) {
    console.error("Error generating nonce:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyWallet = async (req: Request, res: Response): Promise<any> => {
  const { publicKey, signature, message } = req.body;

  try {
    await connectDB();

    if (!publicKey || !signature || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Fetch the nonce from the database
    const nonceRecord = await NonceStore.findOne({ walletAddress: publicKey });
    if (!nonceRecord || nonceRecord.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Nonce expired or invalid" });
    }

    // Ensure the nonce matches the message
    if (!message.includes(nonceRecord.nonce)) {
      return res.status(400).json({ error: "Invalid nonce" });
    }

    // Verify the signature
    const isValid = verifySignature(publicKey, signature, message);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid wallet signature" });
    }

    // Remove the nonce after successful verification
    await NonceStore.deleteOne({ walletAddress: publicKey });

    // Issue a session token or proceed further
    res.status(200).json({
      success: true,
      walletAddress: publicKey,
      message: "Wallet connected successfully",
    });
  } catch (error) {
    console.error("Error during sign-on:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const userExists = async (req: Request, res: Response): Promise<any> => {
  try {
    await connectDB();
    const { walletAddress } = req.body;
    const user = await User.findOne({ walletAddress });
    if (user) {
      return res.status(200).json({ success: true, user });
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during user search:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const registerUser = async (req: Request, res: Response): Promise<any> => {
  try {
    await connectDB();
    const {
      fullName,
      email,
      gender,
      phone,
      country,
      agreeToTerms,
      walletAddress,
    } = req.body;

    if (
      !fullName ||
      !email ||
      !phone ||
      !gender ||
      !country ||
      !walletAddress
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields", receivedPayload: req.body });
    }

    // Check if the wallet address already exists
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Wallet address already registered" });
    }

    // Create a new user
    const newUser = new User({
      fullName,
      email,
      phone,
      gender,
      country,
      agreeToTerms,
      walletAddress,
    });

    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export { generateNonce, registerUser, userExists, verifyWallet };
