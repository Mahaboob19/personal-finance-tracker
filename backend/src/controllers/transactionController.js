import asyncHandler from "../utils/asyncHandler.js";
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "../services/transactionService.js";

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
export const create = asyncHandler(async (req, res) => {
  const { type, amount, category, description, date } = req.body;

  if (!type || !amount || !category) {
    res.status(400);
    throw new Error("Type, amount, and category are required fields");
  }

  const transaction = await createTransaction(req.user.id, {
    type,
    amount,
    category,
    description,
    date,
  });

  res.status(201).json({
    success: true,
    message: "Transaction created successfully",
    data: transaction,
  });
});

/**
 * @desc    Get all transactions for authenticated user (with filtering, search, and sort)
 * @route   GET /api/transactions
 * @access  Private
 */
export const getAll = asyncHandler(async (req, res) => {
  const transactions = await getTransactions(req.user.id, req.query);

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: transactions,
  });
});

/**
 * @desc    Get single transaction by ID
 * @route   GET /api/transactions/:id
 * @access  Private
 */
export const getOne = asyncHandler(async (req, res) => {
  const transaction = await getTransactionById(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    data: transaction,
  });
});

/**
 * @desc    Update a transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
export const update = asyncHandler(async (req, res) => {
  const updatedTransaction = await updateTransaction(
    req.user.id,
    req.params.id,
    req.body
  );

  res.status(200).json({
    success: true,
    message: "Transaction updated successfully",
    data: updatedTransaction,
  });
});

/**
 * @desc    Delete a transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
export const remove = asyncHandler(async (req, res) => {
  await deleteTransaction(req.user.id, req.params.id);

  res.status(200).json({
    success: true,
    message: "Transaction deleted successfully",
    data: { id: req.params.id },
  });
});
