import React from "react";
import { formatCurrency } from "../../utils/formatters.js";

const statusConfig = {
  Normal: {
    color: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "On Track",
  },
  Warning: {
    color: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Near Limit (≥75%)",
  },
  Exceeded: {
    color: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    label: "Exceeded (≥100%)",
  },
};

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const status = statusConfig[budget.status] || statusConfig.Normal;
  const clampedPercentage = Math.min(budget.percentageUsed || 0, 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-800 text-base">{budget.category}</h3>
          <span
            className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border mt-1 ${status.badge}`}
          >
            {status.label}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="Edit Budget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(budget._id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Budget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 my-4">
        <div className="flex justify-between text-xs font-semibold text-slate-600">
          <span>{budget.percentageUsed}% spent</span>
          <span>Budget: {formatCurrency(budget.amount)}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${status.color}`}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>
      </div>

      {/* Spending Breakdown */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-50 text-xs">
        <div>
          <p className="text-slate-400 font-medium">Spent</p>
          <p className="font-bold text-slate-700 text-sm mt-0.5">
            {formatCurrency(budget.amountSpent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 font-medium">Remaining</p>
          <p
            className={`font-bold text-sm mt-0.5 ${
              budget.remainingAmount < 0 ? "text-rose-600" : "text-emerald-600"
            }`}
          >
            {formatCurrency(budget.remainingAmount)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
