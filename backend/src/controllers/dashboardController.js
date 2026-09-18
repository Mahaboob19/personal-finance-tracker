import asyncHandler from "../utils/asyncHandler.js";
import {
  getSummary,
  getMonthlyAnalytics,
  getCategoryAnalytics,
  getSpendingTrends,
} from "../services/dashboardService.js";

/**
 * @desc    Get dashboard summary cards (income, expenses, balance, recent transactions)
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
export const getSummaryController = asyncHandler(async (req, res) => {
  const summary = await getSummary(req.user.id);

  res.status(200).json({
    success: true,
    data: summary,
  });
});

/**
 * @desc    Get monthly analytics for bar/line charts
 * @route   GET /api/dashboard/monthly
 * @access  Private
 */
export const getMonthlyController = asyncHandler(async (req, res) => {
  const monthly = await getMonthlyAnalytics(req.user.id, req.query.year);

  res.status(200).json({
    success: true,
    data: monthly,
  });
});

/**
 * @desc    Get category-wise spending distribution for pie charts & top categories
 * @route   GET /api/dashboard/categories
 * @access  Private
 */
export const getCategoriesController = asyncHandler(async (req, res) => {
  const categories = await getCategoryAnalytics(req.user.id, req.query);

  res.status(200).json({
    success: true,
    data: categories,
  });
});

/**
 * @desc    Get daily spending trajectory trends
 * @route   GET /api/dashboard/trends
 * @access  Private
 */
export const getTrendsController = asyncHandler(async (req, res) => {
  const trends = await getSpendingTrends(req.user.id, req.query.days);

  res.status(200).json({
    success: true,
    data: trends,
  });
});
