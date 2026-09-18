import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Transaction from "../models/Transaction.js";

/**
 * Creates a new category budget for a specified month and year.
 */
export const createBudget = async (userId, data) => {
  const current = new Date();
  const month = Number(data.month) || current.getMonth() + 1;
  const year = Number(data.year) || current.getFullYear();
  const amount = Number(data.amount);
  const category = data.category.trim();

  // Check for existing budget for this user, category, and billing period
  const existing = await Budget.findOne({
    user: userId,
    category,
    month,
    year,
  });

  if (existing) {
    const error = new Error(
      `A budget for '${category}' already exists for ${month}/${year}. Please update the existing budget instead.`
    );
    error.statusCode = 400;
    throw error;
  }

  const budget = await Budget.create({
    user: userId,
    category,
    amount,
    month,
    year,
  });

  return budget;
};

/**
 * Retrieves all budgets for a given month/year and dynamically computes:
 * - amountSpent (aggregated from real expense transactions)
 * - remainingAmount
 * - percentageUsed
 * - status ("Normal", "Warning", "Exceeded")
 */
export const getBudgetsWithProgress = async (userId, query = {}) => {
  const current = new Date();
  const month = Number(query.month) || current.getMonth() + 1;
  const year = Number(query.year) || current.getFullYear();

  // 1. Fetch user's registered budgets for the requested month and year
  const budgets = await Budget.find({
    user: userId,
    month,
    year,
  }).sort({ category: 1 });

  // 2. Define exact UTC date bounds for the month
  const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  // 3. Aggregate all expense transactions in that period grouped by category
  const spendingAggregation = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: "expense",
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$category",
        totalSpent: { $sum: "$amount" },
      },
    },
  ]);

  // Create an O(1) lookup dictionary for category spending
  const spendingMap = {};
  spendingAggregation.forEach((item) => {
    spendingMap[item._id] = item.totalSpent;
  });

  // 4. Augment each budget with calculated metrics and status thresholds
  const enrichedBudgets = budgets.map((budget) => {
    const amountSpent = spendingMap[budget.category] || 0;
    const remainingAmount = budget.amount - amountSpent;
    const percentageUsed =
      budget.amount > 0
        ? Number(((amountSpent / budget.amount) * 100).toFixed(2))
        : 0;

    let status = "Normal";
    if (percentageUsed >= 100) {
      status = "Exceeded";
    } else if (percentageUsed >= 75) {
      status = "Warning";
    }

    return {
      id: budget._id,
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
      amountSpent,
      remainingAmount,
      percentageUsed,
      status,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };
  });

  return enrichedBudgets;
};

/**
 * Updates a budget's allocated amount verifying user ownership.
 */
export const updateBudget = async (userId, budgetId, updateData) => {
  const budget = await Budget.findOne({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    const error = new Error("Budget not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  if (updateData.amount !== undefined) {
    budget.amount = Number(updateData.amount);
  }

  const updatedBudget = await budget.save();
  return updatedBudget;
};

/**
 * Deletes a budget verifying user ownership.
 */
export const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    const error = new Error("Budget not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return { id: budget._id };
};
