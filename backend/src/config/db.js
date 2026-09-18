import mongoose from "mongoose";

/**
 * Connects to MongoDB with event-driven lifecycle monitoring and graceful shutdown.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host} / Database: ${conn.connection.name}`);
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