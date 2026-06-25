import Booking from "../models/Booking.js";
import GuideProfile from "../models/GuideProfile.js";
import Review from "../models/Review.js";
import syncGuideRating from "../utils/guideRating.js";

export const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (booking.travelerId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only review your own bookings" });
  }

  if (booking.status !== "completed") {
    return res
      .status(400)
      .json({ message: "Reviews can only be added after a completed booking" });
  }

  const review = await Review.create({
    bookingId,
    travelerId: req.user._id,
    guideId: booking.guideId,
    rating,
    comment,
  });

  await syncGuideRating(booking.guideId);

  return res.status(201).json({ message: "Review submitted", review });
};

export const getGuideReviews = async (req, res) => {
  const reviews = await Review.find({ guideId: req.params.guideId })
    .populate("travelerId", "name avatar")
    .sort({ createdAt: -1 });

  return res.status(200).json({ reviews });
};

export const updateReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (review.travelerId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only edit your own review" });
  }

  if (typeof req.body.rating !== "undefined") review.rating = req.body.rating;
  if (typeof req.body.comment !== "undefined")
    review.comment = req.body.comment;
  await review.save();
  await syncGuideRating(review.guideId);

  return res.status(200).json({ message: "Review updated", review });
};

export const deleteReview = async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  if (review.travelerId.toString() !== req.user._id.toString()) {
    return res
      .status(403)
      .json({ message: "You can only delete your own review" });
  }

  const guideId = review.guideId;
  await review.deleteOne();
  await syncGuideRating(guideId);

  return res.status(200).json({ message: "Review deleted" });
};

export const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ travelerId: req.user._id })
    .populate({
      path: "guideId",
      populate: { path: "userId", select: "name avatar" },
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ reviews });
};
