import express from "express";
import {
  createReferral,
  getAllReferrals,
  getReferralsByUser,
  updateReferral,
  deleteReferral,
  checkReferralCode,
  createReferralByWallet,
  partialUpdateReferral,
  updateReferralByWalletAddress,
  getReferralTreeByWalletAddress,
  getReferralTreeByUserId,
  updateReferralTree,
} from "../controllers/referral"; // Import the updated referral controllers

const router = express.Router();

// Routes
router.post("/check", checkReferralCode); // Create a new referral
router.post("/", createReferral); // Create a new referral
router.post("/wallet", createReferralByWallet); // Create a new referral
router.get("/", getAllReferrals); // Get all referrals
router.get("/user/:userId", getReferralsByUser); // Get referrals for a specific user
router.patch("/update-by-wallet", updateReferralByWalletAddress);

router.get("/tree/user/:userId", getReferralTreeByUserId);

router.get("/tree/:walletAddress", getReferralTreeByWalletAddress);

router.patch("/tree/update", updateReferralTree);

router.put("/:id", updateReferral); // Update a referral
router.delete("/:id", deleteReferral); // Delete a referral

router.patch("/:id", partialUpdateReferral); // Partial update for a referral

export default router;
