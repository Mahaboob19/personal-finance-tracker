import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import TransactionList from "../components/transactions/TransactionList.jsx";
import TransactionFilters from "../components/transactions/TransactionFilters.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getTransactions,
  deleteTransaction,
} from "../services/transactionService.js";

const TransactionsPage = () => {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    sort: "-date",
    startDate: "",
    endDate: "",
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      // Clean empty params
      const params = {};
      Object.keys(filters).forEach((key) => {
        if (filters[key]) params[key] = filters[key];
      });

      const res = await getTransactions(params);
      setTransactions(res.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Debounce search/filters
    const timer = setTimeout(() => {
      fetchTransactions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchTransactions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      type: "",
      category: "",
      sort: "-date",
      startDate: "",
      endDate: "",
    });
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await deleteTransaction(deleteTargetId);
      setTransactions((prev) => prev.filter((t) => t._id !== deleteTargetId));
      setDeleteTargetId(null);
      showToast("Transaction deleted successfully!");
    } catch (err) {
      showToast(
        err?.response?.data?.message || "Failed to delete transaction.",
        "error"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage and view your financial history
          </p>
        </div>
        <Link
          to="/transactions/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </Link>
      </div>

      {/* Filter Bar */}
      <TransactionFilters
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-800">
            Records{" "}
            {!loading && (
              <span className="text-xs font-medium text-slate-400">
                ({transactions.length})
              </span>
            )}
          </h2>
        </div>

        <TransactionList
          transactions={transactions}
          loading={loading}
          onDelete={(id) => setDeleteTargetId(id)}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Delete Transaction</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm transition-colors disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
