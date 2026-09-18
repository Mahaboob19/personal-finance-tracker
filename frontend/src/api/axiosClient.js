import axios from "axios";

// Automatically adapts to local proxy or production URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Attach Bearer JWT token from localStorage to every outgoing request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("pft_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error formatting & 401 token invalidation
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem("pft_token")) {
        localStorage.removeItem("pft_token");
        localStorage.removeItem("pft_user");
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/register"
        ) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
