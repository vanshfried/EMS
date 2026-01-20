import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // ✅ Store ONLY the date (normalized to 00:00:00)
    date: {
      type: Date,
      required: true,
    },

    // ✅ Employee check-in
    checkInTime: {
      type: Date,
      required: true,
    },

    // ✅ Employee check-out (optional)
    checkOutTime: {
      type: Date,
      default: null,
    },

    // ✅ TOTAL WORKING MINUTES
    workingMinutes: {
      type: Number,
      default: 0,
    },

    // ✅ Status controlled by system/admin
    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      default: "Absent",
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

/* =========================
   INDEX
   Prevent duplicate attendance per employee per day
========================= */
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

/* =========================
   PRE-SAVE HOOK
========================= */
attendanceSchema.pre("save", function () {
  // ✅ Normalize date to midnight (00:00:00)
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }

  // ✅ If employee has checked in, mark Present
  if (this.checkInTime) {
    this.status = "Present";
  }

  // ✅ Calculate working minutes ONLY if checkout exists
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime.getTime() - this.checkInTime.getTime();

    this.workingMinutes = diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
  }
});

export default model("Attendance", attendanceSchema);
