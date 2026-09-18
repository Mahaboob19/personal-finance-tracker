import React, { useState, useEffect, useCallback } from "react";
import BudgetCard from "../components/budgets/BudgetCard.jsx";
import BudgetSummary from "../components/budgets/BudgetSummary.jsx";
import BudgetModal from "../components/budgets/BudgetModal.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { getMonthName } from "../utils/formatters.js";
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../services/budgetService.js";

const BudgetsPage = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getBudgets({
        month: selectedMonth,
        year: selectedYear,
      });
      setBudgets(res.data || []);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to load budget progress."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleCreateOrUpdate = async (formData) => {
    if (editingBudget) {
      await updateBudget(editingBudget._id, { amount: formData.amount });
    } else {
      await createBudget(formData);
    }
    fetchBudgets();
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setIsDeleting(true);
      await deleteBudget(deleteTargetId);
      setBudgets((prev) => prev.filter((b) => b._id !== deleteTargetId));
      setDeleteTargetId(null);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete budget.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBudget(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (budget) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Budgets & Limits</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track monthly spending caps by category
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month/Year selectors */}
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {getMonthName(i + 1)}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-sm font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-indigo-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Set Budget
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {!loading && budgets.length > 0 && <BudgetSummary budgets={budgets} />}

      {/* Budgets Grid */}
      {loading ? (
        <div className="min-h-[30vh] flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-slate-700">
            No budgets configured for {getMonthName(selectedMonth)} {selectedYear}
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-5 max-w-sm mx-auto">
            Set monthly category spending caps to monitor where your money goes and stay within limits.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editingBudget={editingBudget}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
      />

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
              <h3 className="text-lg font-bold text-slate-900">Delete Budget</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to remove this budget? Your transaction history will not be affected.
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

export default BudgetsPage;
