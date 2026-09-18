import React from "react";
import { Outlet, Link } from "react-router-dom";

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30">
            ₹
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Finance<span className="text-indigo-400">Flow</span>
          </span>
        </Link>
        <p className="mt-2 text-sm text-slate-400">
          Personal Finance Tracker & Real-Time Analytics
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20 text-slate-900">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
