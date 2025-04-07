import express from "express";
import {
  createInvestment,
  getInvestments,
  getInvestmentById,
  updateInvestment,
  deleteInvestment,
  getTotalInvestmentsByUser,
  getInvestmentsByPeriod,
} from "../controllers/investment";

const router = express.Router();

// CRUD routes
router.post("/", createInvestment); // Create investment
router.get("/", getInvestments); // Get all investments
router.get("/period", getInvestmentsByPeriod); // Get investments by period (daily, weekly, monthly)
router.get("/user/:walletAddress/total", getTotalInvestmentsByUser); // Get total investments by user
router.get("/:id", getInvestmentById); // Get a specific investment by ID
router.put("/:id", updateInvestment); // Update an investment
router.delete("/:id", deleteInvestment); // Delete an investment

export default router;
