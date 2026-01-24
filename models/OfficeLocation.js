// models/OfficeLocation.js
import mongoose from "mongoose";

const officeLocationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    allowedRadiusMeters: {
      type: Number,
      default: 100, // e.g. 100 meters
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

officeLocationSchema.index({ coordinates: "2dsphere" });

export default mongoose.model("OfficeLocation", officeLocationSchema);
