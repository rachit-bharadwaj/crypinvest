import mongoose, { Schema } from "mongoose";

const InvestmentRequestSchema = new Schema(
  {
    pool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pool",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Resolved", "Failed", "Rejected"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.InvestmentRequest ||
  mongoose.model(
    "InvestmentRequest",
    InvestmentRequestSchema,
    "investmentRequests"
  );
