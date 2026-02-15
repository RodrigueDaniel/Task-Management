import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
})
app.use(limiter);

app.use(cors({
  origin: process.env.CLIENT_URL || "https://localhost:5173",
  credentials: true,
}))

app.use(express.json());
app.use("/api/auth", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500)({
    message: process.env.NODE_ENV === "production" 
    ? "Internal Server Error"
    : err.message,
  })
})

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();