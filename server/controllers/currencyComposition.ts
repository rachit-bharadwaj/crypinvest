import { Request, Response } from "express";
import connectDB from "../database/connection/mongoose";
import CurrencyComposition, { ICurrencyComposition } from "../database/models/CurrencyComposition";

// Create a new Currency Composition (only if none is active)
export const createCurrencyComposition = async (req: Request, res: Response): Promise<any> => {
  await connectDB();

  const { composition } = req.body;
  if (!composition || !Array.isArray(composition)) {
    return res.status(400).json({ error: "Composition array is required." });
  }

  try {
    // Check if an active composition already exists (active means timeFrame.ended is not set)
    const active = await CurrencyComposition.findOne({ "timeFrame.ended": { $exists: false } });
    if (active) {
      return res.status(400).json({ error: "Active currency composition already exists. Use update endpoint instead." });
    }

    const newComposition = await CurrencyComposition.create({
      composition,
      timeFrame: { created: new Date() },
    });

    res.status(201).json({ success: true, currencyComposition: newComposition });
  } catch (error) {
    console.error("Error creating currency composition:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const updateCurrencyComposition = async (req: Request, res: Response): Promise<any> => {
    await connectDB();
  
    const { composition } = req.body;
    if (!composition || !Array.isArray(composition)) {
      return res.status(400).json({ error: "Composition array is required." });
    }
  
    try {
      // Find the current active currency composition
      const active = await CurrencyComposition.findOne({ "timeFrame.ended": { $exists: false } });
      if (active) {
        // Mark the existing one as ended (copy it to history)
        active.timeFrame.ended = new Date();
        await active.save();
      }
  
      // Create a new composition document with the new values
      const newComposition = await CurrencyComposition.create({
        composition,
        timeFrame: { created: new Date() },
      });
  
      res.status(201).json({ success: true, currencyComposition: newComposition });
    } catch (error) {
      console.error("Error updating currency composition:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  export const getCurrentCurrencyComposition = async (req: Request, res: Response): Promise<any> => {
    await connectDB();
  
    try {
      const current = await CurrencyComposition.findOne({ "timeFrame.ended": { $exists: false } });
      if (!current) {
        return res.status(404).json({ error: "No active currency composition found." });
      }
      res.status(200).json({ success: true, currencyComposition: current });
    } catch (error) {
      console.error("Error fetching current currency composition:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  export const getCurrencyCompositionHistory = async (req: Request, res: Response): Promise<any> => {
    await connectDB();
  
    try {
      // Fetch all compositions, sorted by creation date descending
      const compositions = await CurrencyComposition.find().sort({ "timeFrame.created": -1 });
      res.status(200).json({ success: true, currencyCompositions: compositions });
    } catch (error) {
      console.error("Error fetching currency composition history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  

  export const deleteCurrencyComposition = async (req: Request, res: Response): Promise<any> => {
    await connectDB();
  
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "ID is required." });
    }
  
    try {
      const deleted = await CurrencyComposition.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Currency composition not found." });
      }
      res.status(200).json({ success: true, message: "Currency composition deleted." });
    } catch (error) {
      console.error("Error deleting currency composition:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  