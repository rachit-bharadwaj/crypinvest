import express from "express";
import {
  createInvestmentRequest,
  getAllInvestmentRequests,
  getInvestmentRequestById,
  updateInvestmentRequest,
  deleteInvestmentRequest,
  createInvestmentRequestByWalletAndPoolname,
} from "../controllers/investmentRequest";

const router = express.Router();

// CRUD routes
router.post("/", createInvestmentRequest); // Create an investment request
router.post("/wallet", createInvestmentRequestByWalletAndPoolname); // Create an investment request
router.get("/", getAllInvestmentRequests); // Get all investment requests
router.get("/:id", getInvestmentRequestById); // Get a specific investment request by ID
router.put("/:id", updateInvestmentRequest); // Update an investment request
router.delete("/:id", deleteInvestmentRequest); // Delete an investment request

export default router;
