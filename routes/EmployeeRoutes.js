import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import adminAuth from "../middleware/adminAuth.js";
import employeeAuth from "../middleware/employeeAuth.js";

const router = Router();
const { sign } = jwt;

const isProd = process.env.NODE_ENV === "production";

/* =========================
   ADMIN → REGISTER EMPLOYEE
   (PROTECTED BY adminAuth)
========================= */
router.post("/register", adminAuth, async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      department,
      designation,
    } = req.body;

    if (!fullName || !email || !password || !department || !designation) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(409).json({ message: "Employee already exists" });
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
      message: "Employee registered successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   EMPLOYEE LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const employee = await Employee.findOne({ email }).select("+password");
    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, employee.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = sign(
      { employeeId: employee._id },
      process.env.JWT_SECRET,
      { expiresIn: "28d" }
    );

    res.cookie("employeeToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 28 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: "Login successful" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   EMPLOYEE PROFILE
===================== */
router.get("/profile", employeeAuth, (req, res) => {
  const employee = req.employee;

  res.status(200).json({
    fullName: employee.fullName,
    email: employee.email,
    department: employee.department,
    designation: employee.designation,
    address: employee.address,
    emergencyContact: employee.emergencyContact,
    createdByAdminEmail: employee.createdByAdminEmail,
  });
});

/* =====================
   EMPLOYEE UPDATE PROFILE
   (Address + Emergency)
===================== */
router.put("/profile", employeeAuth, async (req, res) => {
  try {
    const { address, emergencyContact } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.employee._id,
      { address, emergencyContact },
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      employee,
    });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   EMPLOYEE LOGOUT
===================== */
router.post("/logout", (req, res) => {
  res.clearCookie("employeeToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
