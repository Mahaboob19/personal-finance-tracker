import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";

/**
 * 1. Financial Summary:
 * Computes total income, total expenses, net balance, transaction count,
 * and fetches the 5 most recent transactions.
 */
export const getSummary = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // Aggregation: Group by transaction type ('income' vs 'expense') and sum amounts
  const totals = await Transaction.aggregate([
    {
      $match: { user: userObjectId },
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
  ]);

  let totalIncome = 0;
  let totalExpenses = 0;
  let transactionCount = 0;

  totals.forEach((item) => {
    if (item._id === "income") {
      totalIncome = item.total;
    } else if (item._id === "expense") {
      totalExpenses = item.total;
    }
    transactionCount += item.count;
  });

  const balance = totalIncome - totalExpenses;

  // Retrieve the 5 most recent transactions
  const recentTransactions = await Transaction.find({ user: userObjectId })
    .sort({ date: -1, createdAt: -1 })
    .limit(5);

  return {
    totalIncome,
    totalExpenses,
    balance,
    transactionCount,
    recentTransactions,
  };
};

/**
 * 2. Monthly Analytics:
 * Aggregates month-by-month income, expenses, and net balance for a given year (defaults to current year).
 */
export const getMonthlyAnalytics = async (userId, yearParam) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const targetYear = Number(yearParam) || new Date().getFullYear();

  const startOfYear = new Date(targetYear, 0, 1, 0, 0, 0, 0);
  const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59, 999);

  const monthlyAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: startOfYear, $lte: endOfYear },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: "$date" }, // 1 to 12
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.month": 1 },
    },
  ]);

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Initialize all 12 months with 0 values to ensure complete chart series
  const monthsData = monthNames.map((name, index) => ({
    month: name,
    monthNumber: index + 1,
    year: targetYear,
    income: 0,
    expense: 0,
    balance: 0,
  }));

  // Populate actual aggregated figures
  monthlyAgg.forEach((item) => {
    const monthIndex = item._id.month - 1;
    if (item._id.type === "income") {
      monthsData[monthIndex].income = item.total;
    } else if (item._id.type === "expense") {
      monthsData[monthIndex].expense = item.total;
    }
    monthsData[monthIndex].balance =
      monthsData[monthIndex].income - monthsData[monthIndex].expense;
  });

  return {
    year: targetYear,
    monthlyData: monthsData,
  };
};

/**
 * 3. Category-wise Spending:
 * Computes expense distribution across categories with totals, transaction count,
 * percentage shares, and top spending categories.
 */
export const getCategoryAnalytics = async (userId, query = {}) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const { month, year } = query;

  const matchFilter = {
    user: userObjectId,
    type: "expense",
  };

  // Optional monthly filter
  if (month && year) {
    const m = Number(month);
    const y = Number(year);
    matchFilter.date = {
      $gte: new Date(y, m - 1, 1, 0, 0, 0, 0),
      $lte: new Date(y, m, 0, 23, 59, 59, 999),
    };
  }

  const categoryAgg = await Transaction.aggregate([
    {
      $match: matchFilter,
    },
    {
      $group: {
        _id: "$category",
        total: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { total: -1 },
    },
  ]);

  const totalExpenses = categoryAgg.reduce((acc, curr) => acc + curr.total, 0);

  const categories = categoryAgg.map((item) => ({
    category: item._id,
    amount: item.total,
    count: item.count,
    percentage:
      totalExpenses > 0
        ? Number(((item.total / totalExpenses) * 100).toFixed(2))
        : 0,
  }));

  return {
    totalExpenses,
    categoryCount: categories.length,
    categories,
    topCategories: categories.slice(0, 5),
  };
};

/**
 * 4. Spending Trends (Day-by-Day Trajectory):
 * Aggregates daily income and expense activity over the past 30 days using $dateToString.
 */
export const getSpendingTrends = async (userId, daysParam = 30) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const days = Number(daysParam) || 30;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const trendsAgg = await Transaction.aggregate([
    {
      $match: {
        user: userObjectId,
        date: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          dateStr: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          type: "$type",
        },
        total: { $sum: "$amount" },
      },
    },
    {
      $sort: { "_id.dateStr": 1 },
    },
  ]);

  // Aggregate into date-keyed dictionary
  const trendMap = {};

  trendsAgg.forEach((item) => {
    const dStr = item._id.dateStr;
    if (!trendMap[dStr]) {
      trendMap[dStr] = { date: dStr, income: 0, expense: 0, net: 0 };
    }
    if (item._id.type === "income") {
      trendMap[dStr].income = item.total;
    } else if (item._id.type === "expense") {
      trendMap[dStr].expense = item.total;
    }
    trendMap[dStr].net = trendMap[dStr].income - trendMap[dStr].expense;
  });

  const trends = Object.values(trendMap).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    days,
    trends,
  };
};
