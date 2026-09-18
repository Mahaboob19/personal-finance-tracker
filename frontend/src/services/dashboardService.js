import axiosClient from "../api/axiosClient.js";

/**
 * Gets high-level summary (total income, expenses, net balance, and recent transactions).
 */
export const getSummary = async () => {
  const response = await axiosClient.get("/dashboard/summary");
  return response.data.data;
};

/**
 * Gets 12-month analytics (income, expense, net savings) for a specific year.
 */
export const getMonthlyAnalytics = async (year) => {
  const response = await axiosClient.get("/dashboard/monthly", {
    params: { year },
  });
  return response.data.data;
};

/**
 * Gets category-wise expense distribution for a given month and year.
 */
export const getCategoryAnalytics = async (params = {}) => {
  const response = await axiosClient.get("/dashboard/categories", { params });
  return response.data.data;
};

/**
 * Gets daily spending trends over the last N days.
 */
export const getSpendingTrends = async (days = 30) => {
  const response = await axiosClient.get("/dashboard/trends", {
    params: { days },
  });
  return response.data.data;
};
