import Transaction from "../models/Transaction.js";

/**
 * Creates a new transaction bound to the authenticated user.
 */
export const createTransaction = async (userId, data) => {
  const transaction = await Transaction.create({
    user: userId,
    type: data.type,
    amount: Number(data.amount),
    category: data.category,
    description: data.description || "",
    date: data.date ? new Date(data.date) : new Date(),
  });

  return transaction;
};

/**
 * Retrieves transactions for a user with flexible filtering, searching, and sorting.
 */
export const getTransactions = async (userId, query = {}) => {
  const { type, category, startDate, endDate, search, sort = "date", order = "desc" } = query;

  // Base query: Strictly isolate by authenticated user ID
  const filter = { user: userId };

  // Filter by Type (income / expense)
  if (type) {
    filter.type = type;
  }

  // Filter by Category
  if (category) {
    filter.category = category;
  }

  // Filter by Date Range
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) {
      filter.date.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of the day if just a date is passed
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.date.$lte = end;
    }
  }

  // Search keyword across description and category
  if (search && search.trim() !== "") {
    filter.$or = [
      { description: { $regex: search.trim(), $options: "i" } },
      { category: { $regex: search.trim(), $options: "i" } },
    ];
  }

  // Dynamic sorting (default: newest date first)
  const sortDirection = order === "asc" ? 1 : -1;
  const sortOptions = {};
  sortOptions[sort] = sortDirection;

  const transactions = await Transaction.find(filter).sort(sortOptions);

  return transactions;
};

/**
 * Retrieves a single transaction by ID verifying user ownership.
 */
export const getTransactionById = async (userId, transactionId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return transaction;
};

/**
 * Updates a transaction verifying user ownership.
 */
export const updateTransaction = async (userId, transactionId, updateData) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  // Apply updates
  if (updateData.type !== undefined) transaction.type = updateData.type;
  if (updateData.amount !== undefined) transaction.amount = Number(updateData.amount);
  if (updateData.category !== undefined) transaction.category = updateData.category;
  if (updateData.description !== undefined) transaction.description = updateData.description;
  if (updateData.date !== undefined) transaction.date = new Date(updateData.date);

  const updatedTransaction = await transaction.save();
  return updatedTransaction;
};

/**
 * Deletes a transaction verifying user ownership.
 */
export const deleteTransaction = async (userId, transactionId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });

  if (!transaction) {
    const error = new Error("Transaction not found or unauthorized");
    error.statusCode = 404;
    throw error;
  }

  return { id: transaction._id };
};
