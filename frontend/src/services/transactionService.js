import axiosClient from "../api/axiosClient.js";

/**
 * Creates a new transaction.
 */
export const createTransaction = async (data) => {
  const response = await axiosClient.post("/transactions", data);
  return response.data.data;
};

/**
 * Gets all transactions for the authenticated user with optional filters.
 */
export const getTransactions = async (params = {}) => {
  const response = await axiosClient.get("/transactions", { params });
  return response.data;
};

/**
 * Gets a single transaction by ID.
 */
export const getTransactionById = async (id) => {
  const response = await axiosClient.get(`/transactions/${id}`);
  return response.data.data;
};

/**
 * Updates an existing transaction.
 */
export const updateTransaction = async (id, data) => {
  const response = await axiosClient.put(`/transactions/${id}`, data);
  return response.data.data;
};

/**
 * Deletes a transaction.
 */
export const deleteTransaction = async (id) => {
  const response = await axiosClient.delete(`/transactions/${id}`);
  return response.data;
};
