import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    travelerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    guideId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuideProfile",
      required: true,
    },
    bookingDate: {
      type: Date,
      required: true,
    },
    numberOfTravelers: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    specialRequests: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    confirmedAt: {
      type: Date,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
