import { Request, Response } from "express";
import Pool from "../database/models/Pool";
import Category from "../database/models/Category";
import connectDB from "../database/connection/mongoose";

// Create a new pool
export const createPool = async (req: Request, res: Response): Promise<any> => {
  await connectDB();
  try {
    const { name, category, minimumDeposit, annualROI } = req.body;

    if (!name || !category || !minimumDeposit || !annualROI) {
      return res.status(400).json({
        error:
          "All fields (name, category, minimumDeposit, annualROI) are required.",
      });
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(404).json({ error: "Category not found." });
    }

    const pool = await Pool.create({
      name,
      category,
      minimumDeposit,
      annualROI,
      investments: [],
    });

    res.status(201).json({ success: true, pool });
  } catch (error) {
    console.error("Error creating pool:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all pools
export const getPools = async (req: Request, res: Response): Promise<any> => {
  await connectDB();

  try {
    const pools = await Pool.find()
      .populate("category")
      .populate("investments");
    res.status(200).json({ success: true, pools });
  } catch (error) {
    console.error("Error fetching pools:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get a pool by ID
export const getPoolById = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const pool = await Pool.findById(req.params.id)
      .populate("category")
      .populate("investments");
    if (!pool) {
      return res.status(404).json({ error: "Pool not found." });
    }
    res.status(200).json({ success: true, pool });
  } catch (error) {
    console.error("Error fetching pool:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Update a pool by ID
export const updatePool = async (req: Request, res: Response): Promise<any> => {
  await connectDB();

  try {
    const { name, category, minimumDeposit, annualROI } = req.body;

    const categoryExists = await Category.findById(category);
    if (category && !categoryExists) {
      return res.status(404).json({ error: "Category not found." });
    }

    const pool = await Pool.findByIdAndUpdate(
      req.params.id,
      { name, category, minimumDeposit, annualROI },
      { new: true, runValidators: true }
    );

    if (!pool) {
      return res.status(404).json({ error: "Pool not found." });
    }
    res.status(200).json({ success: true, pool });
  } catch (error) {
    console.error("Error updating pool:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete a pool by ID
export const deletePool = async (req: Request, res: Response): Promise<any> => {
  await connectDB();
  try {
    const pool = await Pool.findByIdAndDelete(req.params.id);
    if (!pool) {
      return res.status(404).json({ error: "Pool not found." });
    }
    res.status(200).json({ success: true, message: "Pool deleted." });
  } catch (error) {
    console.error("Error deleting pool:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
