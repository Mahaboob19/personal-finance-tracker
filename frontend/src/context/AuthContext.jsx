import React, { createContext, useContext, useState, useEffect } from "react";
import * as authService from "../services/authService.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("pft_user");
      if (!savedUser || savedUser === "undefined" || savedUser === "null") {
        return null;
      }
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("pft_user");
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem("pft_token");
      if (!savedToken || savedToken === "undefined" || savedToken === "null") {
        return null;
      }
      return savedToken;
    } catch {
      localStorage.removeItem("pft_token");
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Validate session against server on startup
  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem("pft_user", JSON.stringify(freshUser));
        } catch (error) {
          console.warn("Session verification failed. Logging out.", error);
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, [token]);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    localStorage.setItem("pft_token", data.token);
    localStorage.setItem("pft_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (details) => {
    const data = await authService.register(details);
    localStorage.setItem("pft_token", data.token);
    localStorage.setItem("pft_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("pft_token");
    localStorage.removeItem("pft_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("pft_user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
