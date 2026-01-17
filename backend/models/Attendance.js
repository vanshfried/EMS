import { Schema, model } from "mongoose";

const attendanceSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
      default: Date.now,
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

/**
 * Automatically calculate working hours when checkOutTime is saved
 */
attendanceSchema.pre("save", function () {
  if (this.checkInTime && this.checkOutTime) {
    const diffMs = this.checkOutTime - this.checkInTime;
    this.workingHours = +(diffMs / (1000 * 60 * 60)).toFixed(2);
  }
  
});

export default model("Attendance", attendanceSchema);
