import axiosClient from "../api/axiosClient.js";

/**
 * Registers a new user.
 */
export const register = async ({ name, email, password }) => {
  const response = await axiosClient.post("/auth/register", {
    name,
    email,
    password,
  });
  return response.data.data;
};

/**
 * Logs in user with email & password.
 */
export const login = async ({ email, password }) => {
  const response = await axiosClient.post("/auth/login", {
    email,
    password,
  });
  return response.data.data;
};

/**
 * Retrieves profile of currently authenticated user.
 */
export const getCurrentUser = async () => {
  const response = await axiosClient.get("/auth/me");
  return response.data.data;
};

/**
 * Updates profile details (e.g. name).
 */
export const updateProfile = async ({ name }) => {
  const response = await axiosClient.put("/users/me", { name });
  return response.data.data;
};
