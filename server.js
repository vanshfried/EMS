import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import adminRoutes from "./routes/AdminRoutes.js";
import employeeRoutes from "./routes/EmployeeRoutes.js";
// Attendance routes
import attendanceRoutes from "./routes/AttendanceRoutes.js";
// Leave routes
import leaveRoutes from "./routes/leaveRoutes.js";
import adminAttendanceRequestRoutes from "./routes/AdminAttendanceRequestRoutes.js";
dotenv.config();

const app = express();

/* =====================
   MIDDLEWARE (ORDER MATTERS)
===================== */

// 1️⃣ CORS (MUST be first)
app.use(
  cors({
    origin: process.env.CLIENT_URL, // e.g. http://localhost:5173
    credentials: true,               // 🔥 REQUIRED for cookies
  })
);

// 2️⃣ JSON body parser
app.use(express.json());

// 3️⃣ COOKIE PARSER (🔥 REQUIRED)
app.use(cookieParser());

/* =====================
   ROUTES
===================== */

// Admin routes
app.use("/admin", adminRoutes);

// Employee routes
app.use("/employee", employeeRoutes);
// Attendance routes
app.use("/attendance", attendanceRoutes);
// Leave routes
app.use("/leaves", leaveRoutes);
// Admin Attendance Request routes
app.use("/admin/attendance-requests", adminAttendanceRequestRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("🚀 Server is running");
});

/* =====================
   DATABASE CONNECTION
===================== */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

/* =====================
   SERVER START
===================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
