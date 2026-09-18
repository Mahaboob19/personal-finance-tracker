import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { updateProfile } from "../services/authService.js";
import { formatDate } from "../utils/formatters.js";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError("Full name must be at least 2 characters long.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const updated = await updateProfile({ name: name.trim() });
      updateUser(updated);
      showToast("Profile updated successfully!");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to update profile."
      );
      showToast("Error updating profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nameStr) => {
    if (!nameStr) return "U";
    return nameStr
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal account settings and security
        </p>
      </div>

      {/* Account Info Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="space-y-1 text-center sm:text-left flex-1">
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <div className="pt-3 flex flex-wrap justify-center sm:justify-start gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Account
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-500">
              Member Since: {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">
          Personal Information
        </h3>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">
              Email is permanently bound to your account and cannot be modified.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl transition-colors disabled:opacity-60 shadow-sm shadow-indigo-500/20"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Security & System Info */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Security & Session
        </h3>
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-semibold text-slate-800">JWT Authentication</p>
            <p className="text-xs text-slate-500">Tokens are cryptographically signed with 7-day expiration</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        </div>
        <div className="flex items-center justify-between text-sm pt-2">
          <div>
            <p className="font-semibold text-slate-800">Password Encryption</p>
            <p className="text-xs text-slate-500">Hashed using salted bcrypt with cost factor 10</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
            Protected
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
