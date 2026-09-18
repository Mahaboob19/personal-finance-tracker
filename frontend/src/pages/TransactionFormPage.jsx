import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TransactionForm from "../components/transactions/TransactionForm.jsx";
import LoadingSpinner from "../components/common/LoadingSpinner.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getTransactionById,
  createTransaction,
  updateTransaction,
} from "../services/transactionService.js";

const TransactionFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const isEditMode = Boolean(id);

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const fetchTx = async () => {
        try {
          setLoading(true);
          const data = await getTransactionById(id);
          setInitialData(data);
        } catch (err) {
          setError(
            err?.response?.data?.message || "Failed to load transaction data."
          );
        } finally {
          setLoading(false);
        }
      };
      fetchTx();
    }
  }, [id, isEditMode]);

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (isEditMode) {
        await updateTransaction(id, formData);
        showToast("Transaction updated successfully!");
      } else {
        await createTransaction(formData);
        showToast("Transaction created successfully!");
      }
      navigate("/transactions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => navigate("/transactions")}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Transactions
        </button>
        <h1 className="text-2xl font-bold text-slate-900">
          {isEditMode ? "Edit Transaction" : "New Transaction"}
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {isEditMode
            ? "Modify the details of your existing record"
            : "Record an income or expense transaction"}
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm">
          <TransactionForm
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={saving}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionFormPage;
