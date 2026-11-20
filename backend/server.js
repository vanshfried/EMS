
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import adminRoutes from "./routes/AdminRoutes.js";
import employeeRoutes from "./routes/EmployeeRoutes.js";
import attendanceRoutes from "./routes/AttendanceRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import adminAttendanceRequestRoutes from "./routes/AdminAttendanceRequestRoutes.js";

const app = express();

// Middleware
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (e.g. server-side tools).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/admin", adminRoutes);
app.use("/employee", employeeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leaves", leaveRoutes);
app.use("/admin/attendance-requests", adminAttendanceRequestRoutes);

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "EMS API is running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
  });
});

// Start server only after database connects
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Atlas connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Application startup failed:", error);
    process.exit(1);
  }
}

startServer();
