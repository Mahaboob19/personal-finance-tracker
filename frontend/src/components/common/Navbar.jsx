import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Hamburger & Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-base shadow-sm">
                ₹
              </div>
              <span className="text-lg font-bold text-slate-900 hidden sm:inline">
                Finance<span className="text-indigo-600">Flow</span>
              </span>
            </Link>
          </div>

          {/* Right: User Profile & Logout */}
          <div className="flex items-center gap-4">
            <Link
              to="/profile"
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-semibold flex items-center justify-center text-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || "User"}</p>
                <p className="text-[11px] text-slate-500 leading-tight truncate max-w-[120px]">{user?.email}</p>
              </div>
            </Link>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
