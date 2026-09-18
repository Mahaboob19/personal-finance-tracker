import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Budget must belong to an authenticated user"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Budget amount is required"],
      min: [0.01, "Budget amount must be at least 0.01"],
    },
    month: {
      type: Number,
      required: [true, "Month is required"],
      min: [1, "Month must be between 1 (January) and 12 (December)"],
      max: [12, "Month must be between 1 (January) and 12 (December)"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2000, "Year must be 2000 or later"],
      max: [2100, "Year cannot exceed 2100"],
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index:
// Enforces that a user can have only ONE budget per category in any given month and year.
budgetSchema.index(
  { user: 1, category: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;
