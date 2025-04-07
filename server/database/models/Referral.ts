import mongoose, { Schema } from "mongoose";

const ReferralSchema = new Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for the referrer
      required: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model for the referee
      required: true,
    },
    commission: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Initiated", "Pending", "Completed"],
      default: "Initiated",
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    level: {
      // This replaces chainLevel
      type: Number,
      default: 1, // Indicates referral depth in the hierarchy
    },
    ancestors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referral",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Export the Referral model
export default mongoose.models.Referral ||
  mongoose.model("Referral", ReferralSchema, "referrals");
