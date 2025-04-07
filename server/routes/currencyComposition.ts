import express from "express";
import {
  createCurrencyComposition,
  updateCurrencyComposition,
  getCurrentCurrencyComposition,
  getCurrencyCompositionHistory,
  deleteCurrencyComposition,
} from "../controllers/currencyComposition";

const router = express.Router();

// Create a new currency composition (only if none active)
router.post("/", createCurrencyComposition);

// Update the currency composition (will mark current as ended and create new one)
router.put("/", updateCurrencyComposition);

// Get the current active currency composition
router.get("/current", getCurrentCurrencyComposition);

// Get the entire history of currency compositions
router.get("/", getCurrencyCompositionHistory);

// Delete a specific currency composition by ID
router.delete("/:id", deleteCurrencyComposition);

export default router;
