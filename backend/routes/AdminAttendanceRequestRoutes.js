import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import AttendanceRequest from "../models/AttendanceRequest.js";

const router = express.Router();

/* =========================
   GET ALL REMOTE WORK REQUESTS
   GET /admin/attendance-requests
========================= */
router.get("/", adminAuth, async (req, res) => {
  try {
    const requests = await AttendanceRequest.find()
      .populate(
        "employee",
        "fullName email department designation"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error("Fetch attendance requests error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch attendance requests",
    });
  }
});

/* =========================
   APPROVE REMOTE WORK REQUEST
   PATCH /admin/attendance-requests/:id/approve
========================= */
router.patch("/:id/approve", adminAuth, async (req, res) => {
  try {
    const request = await AttendanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Prevent reviewing twice
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    request.status = "Approved";
    request.approvedBy = req.admin._id;
    request.approvedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: "Remote work request approved",
      data: request,
    });
  } catch (error) {
    console.error("Approve remote work request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to approve request",
    });
  }
});
/* =========================
   REJECT REMOTE WORK REQUEST
   PATCH /admin/attendance-requests/:id/reject
========================= */
router.patch("/:id/reject", adminAuth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const request = await AttendanceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    // Prevent reviewing twice
    if (request.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Request has already been reviewed",
      });
    }

    request.status = "Rejected";
    request.rejectionReason = rejectionReason?.trim() || "";
    request.approvedBy = req.admin._id;
    request.approvedAt = new Date();

    await request.save();

    res.status(200).json({
      success: true,
      message: "Remote work request rejected",
      data: request,
    });
  } catch (error) {
    console.error("Reject remote work request error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to reject request",
    });
  }
});

export default router;