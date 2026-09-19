import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

/* =========================================================
   CORS CONFIGURATION
   ========================================================= */

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header.
      // Useful for Postman, curl, server-to-server requests, etc.
      if (!origin) {
        return callback(null, true);
      }

      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // During development, allow all origins
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS policy"));
    },

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/* =========================================================
   BODY PARSING
   ========================================================= */

app.use(express.json());

/* =========================================================
   ROOT API
   ========================================================= */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FinanceFlow REST API is running",
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   HEALTH CHECK
   ========================================================= */

app.get("/api/health", (req, res) => {
  const dbStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  const dbState = mongoose.connection.readyState;

  res.status(200).json({
    success: true,
    status: dbState === 1 ? "healthy" : "degraded",
    database: dbStatusMap[dbState] || "unknown",
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

/* =========================================================
   API ROUTES
   ========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/budgets", budgetRoutes);

app.use("/api/dashboard", dashboardRoutes);

/* =========================================================
   404 HANDLER
   ========================================================= */

app.use(notFound);

/* =========================================================
   GLOBAL ERROR HANDLER
   ========================================================= */

app.use(errorHandler);

export default app;