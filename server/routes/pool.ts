import { createPool, deletePool, getPoolById, getPools, updatePool } from "../controllers/pool";
import express from "express";

const router = express.Router();

// Create a new pool
router.post("/", createPool);

// Get all pools
router.get("/", getPools);

// Get a pool by ID
router.get("/:id", getPoolById);

// Update a pool by ID
router.put("/:id", updatePool);

// Delete a pool by ID
router.delete("/:id", deletePool);

export default router;
