import { Schema, model } from "mongoose";

const leaveSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedByAdminEmail: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model("Leave", leaveSchema);
