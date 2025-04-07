import mongoose, { Schema } from "mongoose";

const PoolSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    minimumDeposit: {
      type: Number,
      required: true,
    },
    annualROI: {
      type: String, // e.g., "11% - 50%"
      required: true,
    },
    investments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investment",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Pool ||
  mongoose.model("Pool", PoolSchema, "pools");
