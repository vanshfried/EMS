import { Schema, model } from "mongoose";

const leaveSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["Sick", "Casual", "Paid", "Unpaid", "Other"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedBy: {
      type: String, // admin email
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    adminRemarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* =========================
   PRE-SAVE HOOK
========================= */
leaveSchema.pre("save", function () {
  // Normalize dates
  if (this.startDate) {
    const s = new Date(this.startDate);
    s.setHours(0, 0, 0, 0);
    this.startDate = s;
  }

  if (this.endDate) {
    const e = new Date(this.endDate);
    e.setHours(0, 0, 0, 0);
    this.endDate = e;
  }
});

export default model("Leave", leaveSchema);
