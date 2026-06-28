import express from "express";
import employeeAuth from "../middleware/employeeAuth.js";
import Attendance from "../models/Attendance.js";
import OfficeLocation from "../models/OfficeLocation.js";
import AttendanceRequest from "../models/AttendanceRequest.js";
const router = express.Router();

/* =========================
   📍 Distance Helper (Haversine)
========================= */
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* =========================
   ✅ Employee Check-in
   POST /api/attendance/check-in
========================= */
/* =========================
   ✅ Employee Check-in
   POST /attendance/check-in
========================= */
router.post("/check-in", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const { latitude, longitude } = req.body || {};

    // Normalize today to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ❌ Prevent duplicate check-in
    const existingAttendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (existingAttendance) {
      return res.status(400).json({
        message: "Already checked in today",
      });
    }

    /* ===================================
       ✅ Check for approved remote request
    ==================================== */
    const approvedRemoteRequest = await AttendanceRequest.findOne({
      employee: employeeId,
      date: today,
      type: "Remote Work",
      status: "Approved",
    });

    // ✅ Remote check-in (Skip GPS verification)
    if (approvedRemoteRequest) {
      const attendance = await Attendance.create({
        employee: employeeId,
        date: today,
        checkInTime: new Date(),
        attendanceMode: "Remote",
      });

      return res.status(201).json({
        message: "Remote check-in successful",
        attendance,
      });
    }

    /* ===================================
       OFFICE CHECK-IN (Existing Logic)
    ==================================== */

    // ❌ Location required
    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Location permission is required to check in",
      });
    }

    // ✅ Get active office location
    const office = await OfficeLocation.findOne({ isActive: true });

    if (!office) {
      return res.status(500).json({
        message: "Office location not configured",
      });
    }

    const [officeLng, officeLat] = office.coordinates.coordinates;

    // ✅ Calculate distance from office
    const distance = getDistanceInMeters(
      latitude,
      longitude,
      officeLat,
      officeLng
    );

    // ❌ Outside office radius
    if (distance > office.allowedRadiusMeters) {
      return res.status(403).json({
        message: "You must be inside the office to check in",
        distance: Math.round(distance),
      });
    }

    // ✅ Office attendance
    const attendance = await Attendance.create({
      employee: employeeId,
      date: today,
      checkInTime: new Date(),
      attendanceMode: "Office",
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

/* =========================
   ✅ Employee Check-out
   POST /api/attendance/check-out
========================= */
router.post("/check-out", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;

    // Normalize today to midnight
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

    // ✅ Set checkout time only
    attendance.checkOutTime = new Date();

    // 🔒 workingMinutes & status handled by schema
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

/* =========================
   🏠 Request Remote Work
   POST /attendance/request-remote-work
========================= */
router.post("/request-remote-work", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const { date, reason } = req.body;

    // Validate
    if (!date || !reason?.trim()) {
      return res.status(400).json({
        message: "Date and reason are required",
      });
    }

    // Normalize requested date
    const requestDate = new Date(date);
    requestDate.setHours(0, 0, 0, 0);

    // Tomorrow (today not allowed)
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (requestDate < tomorrow) {
      return res.status(400).json({
        message: "Remote work can only be requested from tomorrow onwards",
      });
    }

    // Prevent duplicate request
    const existingRequest = await AttendanceRequest.findOne({
      employee: employeeId,
      date: requestDate,
      type: "Remote Work",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You have already submitted a request for this date",
      });
    }

    const request = await AttendanceRequest.create({
      employee: employeeId,
      date: requestDate,
      reason: reason.trim(),
    });

    res.status(201).json({
      message: "Remote work request submitted successfully",
      request,
    });
  } catch (error) {
    console.error("Remote work request error:", error);

    res.status(500).json({
      message: "Failed to submit remote work request",
      error: error.message,
    });
  }
});

/* =========================
   📋 My Remote Work Requests
   GET /attendance/my-requests
========================= */
router.get("/my-requests", employeeAuth, async (req, res) => {
  try {
    const requests = await AttendanceRequest.find({
      employee: req.employee._id,
    }).sort({ date: -1 });

    res.json({
      requests,
    });
  } catch (error) {
    console.error("Fetch remote work requests error:", error);

    res.status(500).json({
      message: "Failed to fetch remote work requests",
      error: error.message,
    });
  }
});
/* =========================
   ✅ Attendance Summary
   GET /api/attendance/my/summary
========================= */
router.get("/my/summary", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;

    const summary = await Attendance.aggregate([
      { $match: { employee: employeeId } },
      {
        $group: {
          _id: null,
          totalDays: { $sum: 1 },
          presentDays: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
          leaveDays: {
            $sum: { $cond: [{ $eq: ["$status", "Leave"] }, 1, 0] },
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ["$status", "Half Day"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
          },
        },
      },
    ]);

    const data = summary[0] || {
      totalDays: 0,
      presentDays: 0,
      leaveDays: 0,
      halfDays: 0,
      absentDays: 0,
    };

    res.json({
      totalDays: data.totalDays,
      presentDays: data.presentDays,
      presentRatio:
        data.totalDays > 0
          ? Number(((data.presentDays / data.totalDays) * 100).toFixed(2))
          : 0,
      breakdown: {
        leaveDays: data.leaveDays,
        halfDays: data.halfDays,
        absentDays: data.absentDays,
      },
    });
  } catch (error) {
    console.error("Attendance summary error:", error);
    res.status(500).json({
      message: "Failed to fetch attendance summary",
      error: error.message,
    });
  }
});

/* =========================
   ✅ Attendance History
   GET /api/attendance/my
========================= */
router.get("/my", employeeAuth, async (req, res) => {
  try {
    const attendance = await Attendance.find({
      employee: req.employee._id,
    }).sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    console.error("Fetch attendance error:", error);
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: error.message,
    });
  }
});

export default router;
