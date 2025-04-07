import mongoose, { Schema } from "mongoose";

const WithdrawalSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ["ReferralCommission", "InvestedAmount", "Profit"],
      default: "ReferralCommission",
    },
    penalty: {
      type: Number,
      default: 0,
    },
    requestedDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Rejected"],
      default: "Pending",
    },
    transactionId: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Withdrawal ||
  mongoose.model("Withdrawal", WithdrawalSchema, "withdrawals");
