import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    address: {
      type: String, // Full address as a single string
    },
    agreeToTerms: {
      type: Boolean,
      required: true,
    },
    walletAddress: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String, // URL or path to the profile picture
    },
    avatar: {
      type: String, // URL or path to the profile picture
    },
    capital: {
      type: Number,
      default: 0, // Sum of all investments made by the user
    },
    receivedAmount: {
      type: Number,
      default: 0, // Amount received back by the user (profits/returns)
    },
    investments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Investment",
      },
    ],
    referral: {
      referralCode: {
        type: String,
        unique: true, // Ensure the referral code is unique
      },
      referrals: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Referral",
        },
      ],
      totalCommission: {
        type: Number,
        default: 0,
      },
    },
    documents: {
      residenceProof: {
        doc: {
          type: String, // URL or path to the residence proof document
        },
        verifiedStatus: {
          type: String, // e.g., 'Pending', 'Verified', 'Rejected'
          default: "Pending",
        },
      },
      bankStatement: {
        doc: {
          type: String, // URL or path to the bank statement document
        },
        verifiedStatus: {
          type: String, // e.g., 'Pending', 'Verified', 'Rejected'
          default: "Pending",
        },
      },
      proofOfIncome: {
        doc: {
          type: String, // URL or path to the proof of income document
        },
        verifiedStatus: {
          type: String, // e.g., 'Pending', 'Verified', 'Rejected'
          default: "Pending",
        },
      },
      passport: {
        doc: {
          type: String, // URL or path to the passport document
        },
        verifiedStatus: {
          type: String, // e.g., 'Pending', 'Verified', 'Rejected'
          default: "Pending",
        },
      },
      livePhoto: {
        doc: {
          type: String, // URL or path to the live photo
        },
        verifiedStatus: {
          type: String, // e.g., 'Pending', 'Verified', 'Rejected'
          default: "Pending",
        },
      },
    },
  },

  { timestamps: true }
);

// Pre-save middleware to calculate total commission
UserSchema.pre("save", async function (next) {
  if (this.isModified("investments") || this.isNew) {
    // Populate the user's investments
    await this.populate("investments");

    // Calculate the total received amount (ROI)
    const receivedAmount = (this.investments as any[]).reduce(
      (sum, investment) => sum + (investment.roi || 0),
      0
    );

    this.receivedAmount = receivedAmount;
  }

  if (
    this.referral &&
    Array.isArray(this.referral.referrals) &&
    this.referral.referrals.length > 0
  ) {
    // Populate the referrals
    await this.populate("referral.referrals");

    // Calculate the total commission
    const totalCommission = (this.referral.referrals as any[]).reduce(
      (sum, referral) => sum + (referral.commission || 0),
      0
    );

    this.referral.totalCommission = totalCommission;
  } else {
    // Ensure `totalCommission` is set to 0 if there are no referrals
    if (this.referral) {
      this.referral.totalCommission = 0;
    }
  }

  next();
});


export default mongoose.models.User ||
  mongoose.model("User", UserSchema, "users");
