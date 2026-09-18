import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../../utils/constants.js";

const TransactionForm = ({ initialData, onSubmit, loading }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || "expense",
        amount: initialData.amount !== undefined ? String(initialData.amount) : "",
        category: initialData.category || "",
        description: initialData.description || "",
        date: initialData.date
          ? new Date(initialData.date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData]);

  const categories =
    formData.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // If type switched and current category is not in list, auto-select first or reset
  const handleTypeChange = (newType) => {
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid positive amount.");
      return;
    }
    if (!formData.category) {
      setError("Please select a category.");
      return;
    }
    if (!formData.date) {
      setError("Please pick a transaction date.");
      return;
    }

    try {
      await onSubmit({
        ...formData,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save transaction. Please check inputs and try again."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
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

      {/* Transaction Type Selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange("expense")}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              formData.type === "expense"
                ? "bg-rose-50 border-rose-500 text-rose-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange("income")}
            className={`py-3 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              formData.type === "income"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Income
          </button>
        </div>
      </div>

      {/* Amount and Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-slate-400 font-semibold text-sm">
              ₹
            </span>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={formData.amount}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label htmlFor="date" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Date
        </label>
        <input
          id="date"
          name="date"
          type="date"
          required
          value={formData.date}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Description <span className="text-slate-400 font-normal">(Optional, max 200 chars)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows="3"
          maxLength={200}
          placeholder="e.g., Grocery shopping at supermarket"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors resize-none"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => navigate("/transactions")}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 text-white font-semibold text-sm transition-colors disabled:opacity-60 shadow-sm shadow-indigo-500/20"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {loading ? "Saving..." : initialData ? "Update Transaction" : "Create Transaction"}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
