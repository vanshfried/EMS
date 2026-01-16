import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    title: String,
    message: String,

    target: {
      type: String,
      enum: ["all", "employee"],
      default: "all",
    },

    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model("Notification", notificationSchema);
