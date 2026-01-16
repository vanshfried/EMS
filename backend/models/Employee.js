import { Schema, model } from "mongoose";

const employeeSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      select: false, // never return password by default
    },

    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    createdByAdminEmail: {
      type: String,
      required: true,
      lowercase: true,
    },

    // Added later by employee
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },

    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: {
        type: String,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"],
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default model("Employee", employeeSchema);
