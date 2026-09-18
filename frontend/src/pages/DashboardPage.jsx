import React, { useState, useEffect, useCallback } from "react";
import SummaryCards from "../components/dashboard/SummaryCards.jsx";
import MonthlyChart from "../components/dashboard/MonthlyChart.jsx";
import CategoryPieChart from "../components/dashboard/CategoryPieChart.jsx";
import RecentTransactionsWidget from "../components/dashboard/RecentTransactionsWidget.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import {
  getSummary,
  getMonthlyAnalytics,
  getCategoryAnalytics,
} from "../services/dashboardService.js";

const DashboardPage = () => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [categoryMonth, setCategoryMonth] = useState(currentDate.getMonth() + 1);
  const [categoryYear, setCategoryYear] = useState(currentDate.getFullYear());

  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        getSummary(),
        getMonthlyAnalytics(selectedYear),
        getCategoryAnalytics({ month: categoryMonth, year: categoryYear }),
      ]);

      setSummary(summaryRes);
      setMonthlyData(monthlyRes);
      setCategoryData(categoryRes);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load dashboard insights."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedYear, categoryMonth, categoryYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Financial Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          Welcome back! Here is a summary of your income, expenses, and savings.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary KPI Cards */}
      <SummaryCards summary={summary} />

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart
            data={monthlyData}
            year={selectedYear}
            onYearChange={(y) => setSelectedYear(y)}
          />
        </div>
        <div className="lg:col-span-1">
          <CategoryPieChart
            data={categoryData}
            month={categoryMonth}
            year={categoryYear}
            onMonthChange={(m) => setCategoryMonth(m)}
            onYearChange={(y) => setCategoryYear(y)}
          />
        </div>
      </div>

      {/* Recent Transactions List */}
      <RecentTransactionsWidget transactions={summary?.recentTransactions} />
    </div>
  );
};

export default DashboardPage;
