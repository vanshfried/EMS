import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import adminAuth from "../middleware/adminAuth.js";
import Employee from "../models/Employee.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import OfficeLocation from "../models/OfficeLocation.js";

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

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

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

/* =====================
   ADMIN → ALL EMPLOYEES
===================== */
router.get("/employees", adminAuth, async (req, res) => {
  try {
    const employees = await Employee.find()
      .select("fullName email department designation isActive createdAt")
      .sort({ createdAt: -1 });

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
   ADMIN → SINGLE EMPLOYEE
========================= */
router.get("/employees/:id", adminAuth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);

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
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → EMPLOYEE ATTENDANCE
========================= */
router.get("/employees/:id/attendance", adminAuth, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select(
      "fullName email",
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const attendance = await Attendance.find({
      employee: employee._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      employee,
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → TODAY ATTENDANCE
========================= */
router.get("/attendance/today", adminAuth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employees = await Employee.find().select("fullName email");
    const attendance = await Attendance.find({ date: today });

    const attendanceMap = new Map(
      attendance.map((a) => [a.employee.toString(), a]),
    );

    const result = employees.map((emp) => {
      const record = attendanceMap.get(emp._id.toString());

      return {
        employee: emp,
        attendance: record || {
          employee: emp._id,
          date: today,
          status: "Absent",
          workingMinutes: 0,
          checkInTime: null,
          checkOutTime: null,
        },
      };
    });

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → ALL ATTENDANCE (PAGINATED)
========================= */
router.get("/attendance", adminAuth, async (req, res) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;

    const [attendance, total] = await Promise.all([
      Attendance.find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate("employee", "fullName email")
        .lean(), // 🔥 BIG SPEED BOOST

      Attendance.estimatedDocumentCount(), // 🔥 MUCH faster
    ]);

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      count: attendance.length,
      data: attendance,
    });
  } catch (error) {
    console.error("Get all attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/**
 * =========================
 * ADMIN → UPDATE ATTENDANCE STATUS
 * PATCH /api/admin/attendance/:attendanceId
 * =========================
 */
router.patch("/attendance/:attendanceId", adminAuth, async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const allowedStatuses = ["Present", "Absent", "Half Day", "Leave"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const attendance = await Attendance.findById(req.params.attendanceId);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    // ✅ Admin controls status
    attendance.status = status;

    // ✅ Optional admin remarks
    if (remarks) {
      attendance.remarks = remarks;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Admin update attendance error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → ALL LEAVES
========================= */
router.get("/leaves", adminAuth, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "fullName email department designation")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Get all leaves error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → SINGLE LEAVE
========================= */
router.get("/leaves/:id", adminAuth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id).populate(
      "employee",
      "fullName email department designation",
    );

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (error) {
    console.error("Get leave error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

/* =========================
   ADMIN → REVIEW LEAVE
   PATCH /api/admin/leaves/:leaveId
========================= */
router.patch("/leaves/:leaveId", adminAuth, async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const leave = await Leave.findById(req.params.leaveId);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Leave already reviewed",
      });
    }

    leave.status = status;
    leave.adminRemarks = adminRemarks || null;
    leave.reviewedBy = req.admin.email;
    leave.reviewedAt = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (error) {
    console.error("Review leave error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
/* =========================
   ADMIN → LEAVES BY STATUS
========================= */
router.get("/leaves/status/:status", adminAuth, async (req, res) => {
  try {
    const { status } = req.params;

    if (!["Pending", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const leaves = await Leave.find({ status })
      .populate("employee", "fullName email department");

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (error) {
    console.error("Get leaves by status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
 
/* =========================
   ADMIN → SET OFFICE LOCATION
   POST /api/admin/office-location
========================= */
router.post("/office-location", adminAuth, async (req, res) => {
  try {
    const { name, latitude, longitude, allowedRadiusMeters } = req.body;

    if (
      !name ||
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, latitude and longitude are required",
      });
    }

    // 🔒 Deactivate any existing active office
    await OfficeLocation.updateMany(
      { isActive: true },
      { $set: { isActive: false } }
    );

    // ✅ Create new active office
    const office = await OfficeLocation.create({
      name,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude], // IMPORTANT: lng first
      },
      allowedRadiusMeters: allowedRadiusMeters || 100,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Office location set successfully",
      data: office,
    });
  } catch (error) {
    console.error("Set office location error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set office location",
    });
  }
});

/* =========================
   ADMIN → GET OFFICE LOCATION
   GET /api/admin/office-location
========================= */
router.get("/office-location", adminAuth, async (req, res) => {
  try {
    const office = await OfficeLocation.findOne({ isActive: true });

    if (!office) {
      return res.status(404).json({
        success: false,
        message: "No office location configured",
      });
    }

    res.status(200).json({
      success: true,
      data: office,
    });
  } catch (error) {
    console.error("Get office location error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch office location",
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
