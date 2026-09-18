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

// Configure CORS for local development
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
  })
);

// Parse JSON request bodies
app.use(express.json());

// Root API welcome endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FinanceFlow REST API is running",
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint for monitoring server uptime & database connectivity
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

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Catch-all 404 handler for undefined routes
app.use(notFound);

// Centralized error handling middleware
app.use(errorHandler);

export default app;