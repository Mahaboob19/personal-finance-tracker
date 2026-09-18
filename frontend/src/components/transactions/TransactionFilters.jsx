import React from "react";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../../utils/constants.js";

const TransactionFilters = ({ filters, onChange, onReset }) => {
  const categories =
    filters.type === "income"
      ? INCOME_CATEGORIES
      : filters.type === "expense"
      ? EXPENSE_CATEGORIES
      : [...new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES])].sort();

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              name="search"
              value={filters.search || ""}
              onChange={(e) => onChange("search", e.target.value)}
              placeholder="Search description..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Type
          </label>
          <select
            name="type"
            value={filters.type || ""}
            onChange={(e) => {
              onChange("type", e.target.value);
              onChange("category", ""); // reset category if type changes
            }}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          >
            <option value="">All Types</option>
            <option value="income">Income (+)</option>
            <option value="expense">Expense (-)</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Sort By
          </label>
          <select
            name="sort"
            value={filters.sort || "-date"}
            onChange={(e) => onChange("sort", e.target.value)}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
          >
            <option value="-date">Date: Newest First</option>
            <option value="date">Date: Oldest First</option>
            <option value="-amount">Amount: Highest First</option>
            <option value="amount">Amount: Lowest First</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <input
            type="date"
            name="startDate"
            value={filters.startDate || ""}
            onChange={(e) => onChange("startDate", e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="Start Date"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            name="endDate"
            value={filters.endDate || ""}
            onChange={(e) => onChange("endDate", e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title="End Date"
          />
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default TransactionFilters;
