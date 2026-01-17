import express from "express";
import employeeAuth from "../middleware/employeeAuth.js";
import Attendance from "../models/Attendance.js";

const router = express.Router();

/**
 * ✅ Employee Check-in
 * POST /api/attendance/check-in
 */
router.post("/check-in", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: today, // ✅ IMPORTANT
      checkInTime: new Date(),
    });

    res.status(201).json({
      message: "Check-in successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-in error:", error);
    res.status(500).json({
      message: "Check-in failed",
      error: error.message,
    });
  }
});

/**
 * ✅ Employee Check-out
 * POST /api/attendance/check-out
 */
router.post("/check-out", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (!attendance) {
      return res.status(400).json({
        message: "No check-in found for today",
      });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({
        message: "Already checked out today",
      });
    }

    attendance.checkOutTime = new Date();
    await attendance.save();

    res.json({
      message: "Check-out successful",
      attendance,
    });
  } catch (error) {
    console.error("Check-out error:", error);
    res.status(500).json({
      message: "Check-out failed",
      error: error.message,
    });
  }
});

/**
 * ✅ Get logged-in employee attendance history
 * GET /api/attendance/my
 */
router.get("/my", employeeAuth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.employee._id,
    }).sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

export default router;
