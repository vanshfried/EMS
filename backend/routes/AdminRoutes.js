// backend/routes/AdminRoutes.js
import { Router } from "express";
import { compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminAuth.js";

const router = Router();
const { sign } = jwt;

const isProd = process.env.NODE_ENV === "production";

/* =====================
   ADMIN LOGIN
===================== */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = sign(
      { adminId: admin._id },
      process.env.JWT_SECRET,
      { expiresIn: "28d" }
    );

    res.cookie("adminToken", token, {
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
   ADMIN PROFILE
===================== */
router.get("/profile", adminAuth, (req, res) => {
  res.status(200).json({
    email: req.admin.email,
  });
});

/* =====================
   ADMIN LOGOUT
===================== */
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
