import express from "express";
import employeeAuth from "../middleware/employeeAuth.js";
import Leave from "../models/Leave.js";

const router = express.Router();

/**
 * ✅ Apply for Leave
 * POST /api/leaves/apply
 */
router.post("/apply", employeeAuth, async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const { leaveType, startDate, endDate, reason } = req.body;

    // ❌ Basic validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // ❌ Invalid date range
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        message: "Start date cannot be after end date",
      });
    }

    // ❌ Prevent overlapping leaves (Approved or Pending)
    const overlappingLeave = await Leave.findOne({
      employee: employeeId,
      status: { $in: ["Pending", "Approved"] },
      $or: [
        {
          startDate: { $lte: endDate },
          endDate: { $gte: startDate },
        },
      ],
    });

    if (overlappingLeave) {
      return res.status(400).json({
        message: "You already have a leave in this date range",
      });
    }

    const leave = await Leave.create({
      employee: employeeId,
      leaveType,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    console.error("Apply leave error:", error);
    res.status(500).json({
      message: "Failed to apply leave",
      error: error.message,
    });
  }
});

/**
 * ✅ Get logged-in employee leaves
 * GET /api/leaves/my
 */
router.get("/my", employeeAuth, async (req, res) => {
  try {
    const leaves = await Leave.find({
      employee: req.employee._id,
    }).sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (error) {
    console.error("Fetch leave error:", error);
    res.status(500).json({
      message: "Failed to fetch leaves",
      error: error.message,
    });
  }
});

/**
 * ✅ Cancel leave (ONLY if Pending)
 * DELETE /api/leaves/:id
 */
router.delete("/:id", employeeAuth, async (req, res) => {
  try {
    const leave = await Leave.findOne({
      _id: req.params.id,
      employee: req.employee._id,
    });

    if (!leave) {
      return res.status(404).json({
        message: "Leave not found",
      });
    }

    if (leave.status !== "Pending") {
      return res.status(400).json({
        message: "Only pending leaves can be cancelled",
      });
    }

    await leave.deleteOne();

    res.json({
      message: "Leave cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel leave error:", error);
    res.status(500).json({
      message: "Failed to cancel leave",
      error: error.message,
    });
  }
});

export default router;
