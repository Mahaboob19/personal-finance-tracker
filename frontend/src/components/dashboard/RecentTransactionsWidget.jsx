import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const RecentTransactionsWidget = ({ transactions }) => {
  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
        </div>
        <div className="text-center py-8 text-xs text-slate-400">
          No recent transactions found.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
          <p className="text-xs text-slate-500">Your latest 5 financial entries</p>
        </div>
        <Link
          to="/transactions"
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          View All →
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {transactions.map((tx) => {
          const isIncome = tx.type === "income";
          return (
            <div
              key={tx._id}
              className="py-3 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isIncome
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {isIncome ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {tx.description || tx.category}
                  </p>
                  <p className="text-xs text-slate-400">
                    {formatDate(tx.date)} • {tx.category}
                  </p>
                </div>
              </div>
              <div
                className={`text-sm font-bold whitespace-nowrap ${
                  isIncome ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isIncome ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentTransactionsWidget;
