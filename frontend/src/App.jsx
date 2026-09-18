import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import TransactionsPage from "./pages/TransactionsPage.jsx";
import TransactionFormPage from "./pages/TransactionFormPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

function App() {
  return (
    <Routes>
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Public Routes — redirect to dashboard if already authenticated */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Protected Routes — redirect to login if not authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/add" element={<TransactionFormPage />} />
          <Route path="/transactions/edit/:id" element={<TransactionFormPage />} />
          {/* Additional pages will be added in subsequent phases */}
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
