const mongoose = require("mongoose");

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables.");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.warn("MongoDB connection failed, continuing without database:", error.message);
    console.warn("Some features may not work properly without database connection.");
    // Don't throw error, allow server to continue
  }
};

module.exports = { connectDatabase };
