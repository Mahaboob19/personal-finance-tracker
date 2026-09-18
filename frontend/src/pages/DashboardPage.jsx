import React from "react";

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your financial overview</p>
      </div>
      <div className="flex items-center justify-center min-h-[40vh] bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">📊</div>
          <h2 className="text-lg font-semibold text-slate-700">Dashboard Coming in Phase 13</h2>
          <p className="text-sm text-slate-500 mt-1">
            Authentication is working. Charts and analytics will appear here after Phase 13.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
