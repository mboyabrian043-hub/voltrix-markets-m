const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDatabase } = require("./config/db");
const apiRoutes = require("./routes");
const { initializeSocket } = require("./websocket/socketServer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "Volatrix backend foundation" });
});
app.use("/api", apiRoutes);

const startServer = async () => {
  try {
    await connectDatabase();
    initializeSocket();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
