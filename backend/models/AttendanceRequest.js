import { Schema, model } from "mongoose";

const attendanceRequestSchema = new Schema(
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

    type: {
      type: String,
      enum: ["Remote Work"],
      default: "Remote Work",
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

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Normalize request date to midnight
attendanceRequestSchema.pre("save", function () {
  if (this.date) {
    const d = new Date(this.date);
    d.setHours(0, 0, 0, 0);
    this.date = d;
  }
});

// One request per employee per date per type
attendanceRequestSchema.index(
  { employee: 1, date: 1, type: 1 },
  { unique: true }
);

export default model("AttendanceRequest", attendanceRequestSchema);