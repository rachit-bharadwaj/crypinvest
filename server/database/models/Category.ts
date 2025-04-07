import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
  },

  { timestamps: true }
);

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema, "categories");
