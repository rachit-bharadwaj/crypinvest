import express from "express";
import {
  verifyWallet,
  registerUser,
  userExists,
  generateNonce,
} from "../controllers/auth";

const authRoutes = express.Router();

// Generate Nonce Route
authRoutes.post("/nonce", generateNonce);

// Verify Wallet Route
authRoutes.post("/verify-wallet", verifyWallet);

// User Exists Route
authRoutes.post("/user-exists", userExists);

// Register User Route
authRoutes.post("/register", registerUser);

export default authRoutes;
