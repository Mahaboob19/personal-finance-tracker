import axiosClient from "../api/axiosClient.js";

/**
 * Gets all budgets with progress for a specific month and year.
 */
export const getBudgets = async (params = {}) => {
  const response = await axiosClient.get("/budgets", { params });
  return response.data;
};

/**
 * Creates a new budget.
 */
export const createBudget = async (data) => {
  const response = await axiosClient.post("/budgets", data);
  return response.data.data;
};

/**
 * Updates an existing budget amount.
 */
export const updateBudget = async (id, data) => {
  const response = await axiosClient.put(`/budgets/${id}`, data);
  return response.data.data;
};

/**
 * Deletes a budget.
 */
export const deleteBudget = async (id) => {
  const response = await axiosClient.delete(`/budgets/${id}`);
  return response.data;
};
