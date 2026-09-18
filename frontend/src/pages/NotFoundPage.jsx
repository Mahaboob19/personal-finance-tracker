import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-black text-slate-200">404</p>
      <h1 className="text-2xl font-bold text-slate-800 mt-2">Page Not Found</h1>
      <p className="text-slate-500 mt-2 text-sm max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
