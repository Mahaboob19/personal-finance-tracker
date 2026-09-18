import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import budgetRoutes from "./routes/budgetRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the built React frontend (frontend/dist)
// __dirname = backend/src/  →  ../../frontend/dist = frontend/dist
const frontendDist = join(__dirname, "..", "..", "frontend", "dist");

// Configure CORS — only needed for local development (in production, same-origin)
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman) or in development
      if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.includes(origin)) {
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
app.get("/api", (req, res) => {
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

// --- Production: Serve built React SPA from frontend/dist ---
if (process.env.NODE_ENV === "production" && existsSync(frontendDist)) {
  // Serve static assets (JS, CSS, images, etc.)
  app.use(express.static(frontendDist));

  // SPA fallback — all non-API routes return index.html so React Router works
  app.get("*", (req, res) => {
    res.sendFile(join(frontendDist, "index.html"));
  });
} else {
  // Development: 404 handler for undefined routes
  app.use(notFound);
}

// Centralized error handling middleware (always last)
app.use(errorHandler);

export default app;