import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

const typeConfig = {
  income: {
    label: "Income",
    badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    amount: "text-emerald-600 font-bold",
    sign: "+",
  },
  expense: {
    label: "Expense",
    badge: "bg-rose-100 text-rose-700 border border-rose-200",
    amount: "text-rose-600 font-bold",
    sign: "-",
  },
};

const TransactionList = ({ transactions, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-lg font-semibold text-slate-700">No transactions found</h3>
        <p className="text-sm text-slate-500 mt-1 mb-5">
          Add your first transaction to start tracking your finances.
        </p>
        <Link
          to="/transactions/add"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
            <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
            <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
            <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="text-right py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
            <th className="text-center py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((tx) => {
            const config = typeConfig[tx.type] || typeConfig.expense;
            return (
              <tr
                key={tx._id}
                className="bg-white hover:bg-slate-50 transition-colors group"
              >
                <td className="py-3.5 px-5 text-slate-500 whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>
                <td className="py-3.5 px-5 max-w-[180px]">
                  <p className="font-medium text-slate-800 truncate">
                    {tx.description || tx.category}
                  </p>
                </td>
                <td className="py-3.5 px-5">
                  <span className="inline-block bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-lg">
                    {tx.category}
                  </span>
                </td>
                <td className="py-3.5 px-5">
                  <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg ${config.badge}`}>
                    {config.label}
                  </span>
                </td>
                <td className={`py-3.5 px-5 text-right whitespace-nowrap ${config.amount}`}>
                  {config.sign}{formatCurrency(tx.amount)}
                </td>
                <td className="py-3.5 px-5">
                  <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/transactions/edit/${tx._id}`}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => onDelete(tx._id)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionList;
