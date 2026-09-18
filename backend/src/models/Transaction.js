import mongoose from "mongoose";

// Predefined categories for UI and default validation
export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Shopping",
  "Bills",
  "Entertainment",
  "Healthcare",
  "Education",
  "Rent",
  "Travel",
  "Other",
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Transaction must belong to an authenticated user"],
      index: true,
    },
    type: {
      type: String,
      required: [true, "Transaction type is required"],
      enum: {
        values: ["income", "expense"],
        message: "{VALUE} is not a valid transaction type. Must be 'income' or 'expense'",
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be at least 0.01"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
      default: "",
    },
    date: {
      type: Date,
      required: [true, "Transaction date is required"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal query performance
// 1. Speeds up fetching user transactions ordered by date (most frequent query)
transactionSchema.index({ user: 1, date: -1 });

// 2. Speeds up filtering by user and transaction type (income vs expense)
transactionSchema.index({ user: 1, type: 1 });

// 3. Speeds up category-specific spending summaries and budget tracking
transactionSchema.index({ user: 1, category: 1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

export default Transaction;
