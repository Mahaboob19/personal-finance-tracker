import React from "react";
import { formatCurrency } from "../../utils/formatters.js";

const BudgetSummary = ({ budgets }) => {
  const totalBudget = budgets.reduce((acc, b) => acc + (b.amount || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + (b.amountSpent || 0), 0);
  const totalRemaining = totalBudget - totalSpent;
  const overallPercentage =
    totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Budget Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total Monthly Budget
        </p>
        <p className="text-2xl font-black text-slate-900 mt-2">
          {formatCurrency(totalBudget)}
        </p>
        <p className="text-xs text-slate-500 mt-1">Across {budgets.length} categories</p>
      </div>

      {/* Total Spent Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total Spent This Month
        </p>
        <p className="text-2xl font-black text-rose-600 mt-2">
          {formatCurrency(totalSpent)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallPercentage >= 100
                  ? "bg-rose-500"
                  : overallPercentage >= 75
                  ? "bg-amber-500"
                  : "bg-indigo-500"
              }`}
              style={{ width: `${overallPercentage}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-600">
            {overallPercentage}%
          </span>
        </div>
      </div>

      {/* Remaining Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Total Budget Remaining
        </p>
        <p
          className={`text-2xl font-black mt-2 ${
            totalRemaining < 0 ? "text-rose-600" : "text-emerald-600"
          }`}
        >
          {formatCurrency(totalRemaining)}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          {totalRemaining < 0 ? "Over overall budget" : "Safe to spend"}
        </p>
      </div>
    </div>
  );
};

export default BudgetSummary;
