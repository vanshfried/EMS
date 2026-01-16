// backend/middleware/adminAuth.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const adminAuth = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX HERE: use decoded.adminId
    const admin = await Admin.findById(decoded.adminId).select("-password");

    if (!admin) {
      return res.status(401).json({ message: "Invalid admin session" });
    }

    // Attach admin
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Admin authentication failed" });
  }
};

export default adminAuth;
