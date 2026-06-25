import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    travelerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuideProfile",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

reviewSchema.index({ bookingId: 1, travelerId: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
