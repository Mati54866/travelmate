import mongoose from "mongoose";

const guideProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      trim: true,
    },
    languages: {
      type: [String],
      required: [true, "At least one language is required"],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 5,
      max: 500,
    },
    operatingCities: {
      type: [String],
      required: [true, "At least one city is required"],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const GuideProfile = mongoose.model("GuideProfile", guideProfileSchema);

export default GuideProfile;
