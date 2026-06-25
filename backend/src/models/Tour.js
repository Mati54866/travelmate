import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuideProfile",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    duration: {
      type: Number,
      required: true,
    },
    pricePerPerson: {
      type: Number,
      required: true,
    },
    maxGroupSize: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    includedItems: {
      type: [String],
      default: [],
    },
    excludedItems: {
      type: [String],
      default: [],
    },
    meetingPoint: {
      type: String,
      required: [true, "Meeting point is required"],
    },
    images: {
      type: [String],
      default: [],
    },
    imagePublicIds: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    availableDates: {
      type: [Date],
      default: [],
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const Tour = mongoose.model("Tour", tourSchema);

export default Tour;
