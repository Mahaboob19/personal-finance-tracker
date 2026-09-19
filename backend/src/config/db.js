import mongoose from "mongoose";

/**
 * Connects to MongoDB with environment-aware URI selection,
 * event-driven lifecycle monitoring, and graceful shutdown.
 * - Development: defaults to local MongoDB (mongodb://localhost:27017/FinFlow)
 * - Production: uses MongoDB Atlas connection string (MONGO_URI_PROD or MONGO_URI)
 */
const connectDB = async () => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const mongoUri = isProduction
      ? process.env.MONGO_URI_PROD || process.env.MONGO_URI
      : process.env.MONGO_URI || "mongodb://localhost:27017/FinFlow";

    if (!mongoUri) {
      throw new Error(
        "MongoDB connection string is missing. Please set MONGO_URI or MONGO_URI_PROD in your environment."
      );
    }

    const conn = await mongoose.connect(mongoUri);
    const envLabel = isProduction ? "PRODUCTION (Atlas)" : "DEVELOPMENT (Local)";
    console.log(
      `MongoDB Connected [${envLabel}]: ${conn.connection.host} / Database: ${conn.connection.name}`
    );
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

// Lifecycle Event Listeners
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB connection lost. Attempting reconnection...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected successfully.");
});

mongoose.connection.on("error", (err) => {
  console.error(`MongoDB Runtime Error: ${err.message}`);
});

// Handle graceful process termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination.");
  process.exit(0);
});

export default connectDB;