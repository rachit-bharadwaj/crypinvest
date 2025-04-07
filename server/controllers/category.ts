import { Request, Response } from "express";
import Category from "../database/models/Category";
import connectDB from "../database/connection/mongoose";

// Create a new category
export const createCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required." });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get all categories
export const getCategories = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Get a category by ID
export const getCategoryById = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Update a category by ID
export const updateCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();

  try {
    const { name, description } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Delete a category by ID
export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<any> => {
  await connectDB();
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found." });
    }
    res.status(200).json({ success: true, message: "Category deleted." });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
