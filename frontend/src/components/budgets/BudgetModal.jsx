import React, { useState, useEffect } from "react";
import { EXPENSE_CATEGORIES } from "../../utils/constants.js";

const BudgetModal = ({ isOpen, onClose, onSubmit, editingBudget, currentMonth, currentYear }) => {
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: currentMonth,
    year: currentYear,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category || "",
        amount: editingBudget.amount !== undefined ? String(editingBudget.amount) : "",
        month: editingBudget.month || currentMonth,
        year: editingBudget.year || currentYear,
      });
    } else {
      setFormData({
        category: "",
        amount: "",
        month: currentMonth,
        year: currentYear,
      });
    }
    setError("");
  }, [editingBudget, currentMonth, currentYear, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
      });
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save budget. Please check inputs and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {editingBudget ? "Edit Category Budget" : "Set New Budget"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-9v2a1 1 0 11-2 0V9a1 1 0 012 0zm-1 5a1 1 0 100 2 1 1 0 000-2z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Expense Category
            </label>
            <select
              disabled={Boolean(editingBudget)}
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <option value="">Select Category</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Monthly Budget Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
                ₹
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="e.g. 5000"
                value={formData.amount}
                onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm shadow-indigo-500/20"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Saving..." : editingBudget ? "Update Budget" : "Create Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
