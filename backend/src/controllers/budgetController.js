import asyncHandler from "../utils/asyncHandler.js";
import {
  createBudget,
  getBudgetsWithProgress,
  updateBudget,
  deleteBudget,
} from "../services/budgetService.js";

/**
 * @desc    Create a monthly budget
 * @route   POST /api/budgets
 * @access  Private
 */
export const create = asyncHandler(async (req, res) => {
  const { category, amount, month, year } = req.body;

  if (!category || amount === undefined) {
    res.status(400);
    throw new Error("Category and amount are required fields");
  }

  const budget = await createBudget(req.user.id, {
    category,
    amount,
    month,
    year,
  });

  res.status(201).json({
    success: true,
    message: "Budget created successfully",
    data: budget,
  });
});

/**
 * @desc    Get all budgets for current/specified month with live spending calculations
 * @route   GET /api/budgets
 * @access  Private
 */
export const getAll = asyncHandler(async (req, res) => {
  const budgets = await getBudgetsWithProgress(req.user.id, req.query);

  res.status(200).json({
    success: true,
    count: budgets.length,
    data: budgets,
  });
});

/**
 * @desc    Update a budget amount
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
export const update = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (amount === undefined || Number(amount) <= 0) {
    res.status(400);
    throw new Error("A valid positive amount is required");
  }

  const updatedBudget = await updateBudget(req.user.id, req.params.id, {
    amount,
  });

  res.status(200).json({
    success: true,
    message: "Budget updated successfully",
    data: updatedBudget,
  });
});

/**
 * @desc    Delete a budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
export const remove = asyncHandler(async (req, res) => {
  await deleteBudget(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Budget deleted successfully",
    data: { id: req.params.id },
  });
});
