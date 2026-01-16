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
    },

    checkIn: {
      type: Date,
    },

    checkOut: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["present", "absent", "half-day"],
      default: "present",
    },
  },
  { timestamps: true }
);

export default model("Attendance", attendanceSchema);
