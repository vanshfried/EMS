// backend/routes/EmployeeRoutes.js
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import adminAuth from "../middleware/adminAuth.js";
import employeeAuth from "../middleware/employeeAuth.js";

const router = Router();
const isProd = process.env.NODE_ENV === "production";

/* =========================
   ADMIN → REGISTER EMPLOYEE
========================= */
router.post("/register", adminAuth, async (req, res) => {
  try {
    let { fullName, email, password, department, designation } = req.body;

    if (!fullName || !email || !password || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    email = email.toLowerCase().trim();

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "Employee already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Employee.create({
      fullName,
      email,
      password: hashedPassword,
      department,
      designation,
      createdByAdminEmail: req.admin.email,
    });

    res.status(201).json({
      success: true,
      message: "Employee registered successfully",
    });
  } catch (error) {
    console.error("Employee register error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================
   EMPLOYEE LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    email = email.toLowerCase().trim();

    const employee = await Employee.findOne({ email }).select("+password");
    if (!employee) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { employeeId: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: "14d" }
    );

    res.cookie("employeeToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Employee login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================
   EMPLOYEE PROFILE
===================== */
router.get("/profile", employeeAuth, (req, res) => {
  const e = req.employee;

  res.status(200).json({
    success: true,
    data: {
      fullName: e.fullName,
      email: e.email,
      department: e.department,
      designation: e.designation,
      address: e.address,
      emergencyContact: e.emergencyContact,
    },
  });
});

/* =====================
   UPDATE PROFILE
===================== */
router.put("/profile", employeeAuth, async (req, res) => {
  try {
    const { address, emergencyContact } = req.body;

    await Employee.findByIdAndUpdate(req.employee._id, {
      address,
      emergencyContact,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =====================
   EMPLOYEE LOGOUT
===================== */
router.post("/logout", employeeAuth, (req, res) => {
  res.clearCookie("employeeToken", {
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
