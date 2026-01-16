// backend/routes/AdminRoutes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminAuth.js";
import Employee from "../models/Employee.js";
const router = Router();
const isProd = process.env.NODE_ENV === "production";

/* =====================
   ADMIN LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // shorter for admin security
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================
   ADMIN PROFILE
===================== */
router.get("/profile", adminAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      email: req.admin.email,
      id: req.admin._id,
    },
  });
});

router.get("/employees", adminAuth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    console.error("Get employees error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
/* =========================
   ADMIN → GET SINGLE EMPLOYEE
========================= */
router.get("/employees/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get single employee error:", error);

    // Handles invalid ObjectId as well
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================
   ADMIN LOGOUT
===================== */
router.post("/logout", adminAuth, (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
