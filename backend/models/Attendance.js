import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // Store ONLY the date (00:00:00) – critical for queries
    date: {
      type: Date,
      required: true,
    },

    checkInTime: {
      type: Date,
      required: true,
    },

    checkOutTime: {
      type: Date,
    },

    workingHours: {
      type: Number, // stored in hours (e.g. 8.5)
      default: 0,
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Half Day", "Leave"],
      default: "Present",
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

/* =========================
   INDEX (VERY IMPORTANT)
   Prevent duplicate attendance per day
========================= */
attendanceSchema.index(
  { employee: 1, date: 1 },
  { unique: true }
);

/* =========================
   PRE-SAVE HOOKS
========================= */
attendanceSchema.pre("save", function (next) {
  // Normalize date to midnight (00:00:00)
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }

  // Calculate working hours
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.workingHours = +(
      diffMs / (1000 * 60 * 60)
    ).toFixed(2);
  }

  next();
});

export default model("Attendance", attendanceSchema);
