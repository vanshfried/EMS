import { Schema, model } from "mongoose";

const adminSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // 🔐 CRITICAL FIX
    },
  },
  {
    timestamps: true,
  }
);

export default model("Admin", adminSchema);
