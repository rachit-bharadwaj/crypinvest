import mongoose, { Schema, Document } from "mongoose";

export interface IComposition {
  currency: string;
  percentage: number;
}

export interface ICurrencyComposition extends Document {
  composition: IComposition[];
  timeFrame: {
    created: Date;
    ended?: Date;
  };
}

const CurrencyCompositionSchema: Schema = new Schema(
  {
    composition: [
      {
        currency: { type: String, required: true },
        percentage: { type: Number, required: true },
      },
    ],
    timeFrame: {
      created: { type: Date, default: Date.now },
      ended: { type: Date },
    },
  },
  {
    // You can still use timestamps if needed; here we are storing our own created date.
    // timestamps: true,
  }
);

export default mongoose.models.CurrencyComposition ||
  mongoose.model<ICurrencyComposition>(
    "CurrencyComposition",
    CurrencyCompositionSchema,
    "currencyCompositions"
  );
