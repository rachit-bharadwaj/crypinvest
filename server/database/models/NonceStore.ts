import mongoose, { Schema } from "mongoose";

const NonceStoreSchema = new Schema(
  {
    walletAddress: { type: String, required: true, unique: true },
    nonce: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.NonceStore ||
  mongoose.model("NonceStore", NonceStoreSchema, "nonceStore");
