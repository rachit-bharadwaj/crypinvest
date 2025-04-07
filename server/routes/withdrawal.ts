import express from "express";
import {
  createWithdrawal,
  getAllWithdrawals,
  getWithdrawalById,
  updateWithdrawal,
  deleteWithdrawal,
  getWithdrawalsByWalletAddress,
} from "../controllers/withdrawal";

const router = express.Router();

// Create a new withdrawal
router.post("/", createWithdrawal);

// Get all withdrawals
router.get("/", getAllWithdrawals);

// Get a single withdrawal by ID
router.get("/:id", getWithdrawalById);

router.get("/user/:walletAddress", getWithdrawalsByWalletAddress);

// Update a withdrawal
router.put("/:id", updateWithdrawal);

// Delete a withdrawal
router.delete("/:id", deleteWithdrawal);

export default router;
