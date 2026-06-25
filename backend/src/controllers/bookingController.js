import Booking from "../models/Booking.js";
import GuideProfile from "../models/GuideProfile.js";
import Tour from "../models/Tour.js";

const populateBooking = [
  { path: "travelerId", select: "name email avatar gender" },
  {
    path: "guideId",
    populate: { path: "userId", select: "name email avatar gender" },
  },
  {
    path: "tourId",
    select: "title pricePerPerson images meetingPoint duration",
  },
];

export const createBooking = async (req, res) => {
  const { tourId, bookingDate, numberOfTravelers, specialRequests } = req.body;
  const tour = await Tour.findById(tourId);

  if (!tour || tour.status !== "active") {
    return res.status(404).json({ message: "Tour not found or inactive" });
  }

  const selectedDateObject = new Date(bookingDate);
  if (Number.isNaN(selectedDateObject.getTime())) {
    return res.status(400).json({ message: "Booking date is invalid" });
  }

  const selectedDate = selectedDateObject.toDateString();
  const normalizedAvailableDates = Array.isArray(tour.availableDates)
    ? tour.availableDates
        .map((availableDate) => new Date(availableDate))
        .filter((availableDate) => !Number.isNaN(availableDate.getTime()))
    : [];

  if (!normalizedAvailableDates.length) {
    return res
      .status(400)
      .json({ message: "This tour has no valid available dates yet" });
  }

  const hasAvailability = normalizedAvailableDates.some(
    (availableDate) => availableDate.toDateString() === selectedDate,
  );

  if (!hasAvailability) {
    return res
      .status(400)
      .json({ message: "Selected date is not available for this tour" });
  }

  // Prevent traveler from booking the same tour more than once (unless cancelled)
  const existing = await Booking.findOne({
    travelerId: req.user._id,
    tourId: tour._id,
    status: { $ne: "cancelled" },
  });

  if (existing) {
    return res
      .status(400)
      .json({ message: "You already have a booking for this tour" });
  }

  const booking = await Booking.create({
    travelerId: req.user._id,
    tourId: tour._id,
    guideId: tour.guideId,
    bookingDate,
    numberOfTravelers,
    totalPrice: numberOfTravelers * tour.pricePerPerson,
    specialRequests,
  });

  const populated = await Booking.findById(booking._id).populate(
    populateBooking,
  );

  return res
    .status(201)
    .json({ message: "Booking created", booking: populated });
};

export const getMyBookings = async (req, res) => {
  const bookings = await Booking.find({ travelerId: req.user._id })
    .populate(populateBooking)
    .sort({ createdAt: -1 });

  return res.status(200).json({ bookings });
};

export const getGuideBookings = async (req, res) => {
  const guideProfile = await GuideProfile.findOne({ userId: req.user._id });

  if (!guideProfile) {
    return res.status(200).json({ bookings: [] });
  }

  const bookings = await Booking.find({ guideId: guideProfile._id })
    .populate(populateBooking)
    .sort({ createdAt: -1 });

  return res.status(200).json({ bookings });
};

export const confirmBooking = async (req, res) => {
  const guideProfile = await GuideProfile.findOne({ userId: req.user._id });
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (
    !guideProfile ||
    booking.guideId.toString() !== guideProfile._id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "You can only confirm your own bookings" });
  }

  booking.status = "confirmed";
  booking.confirmedAt = new Date();
  booking.paymentStatus =
    booking.paymentStatus === "pending" ? "paid" : booking.paymentStatus;
  await booking.save();

  const populated = await Booking.findById(booking._id).populate(
    populateBooking,
  );

  return res
    .status(200)
    .json({ message: "Booking confirmed", booking: populated });
};

export const cancelBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const guideProfile =
    req.user.role === "guide"
      ? await GuideProfile.findOne({ userId: req.user._id })
      : null;
  const canCancel =
    booking.travelerId.toString() === req.user._id.toString() ||
    (guideProfile &&
      booking.guideId.toString() === guideProfile._id.toString());

  if (!canCancel) {
    return res.status(403).json({ message: "You cannot cancel this booking" });
  }

  booking.status = "cancelled";
  booking.paymentStatus =
    booking.paymentStatus === "paid" ? "refunded" : booking.paymentStatus;
  await booking.save();

  const populated = await Booking.findById(booking._id).populate(
    populateBooking,
  );

  return res
    .status(200)
    .json({ message: "Booking cancelled", booking: populated });
};

export const completeBooking = async (req, res) => {
  const guideProfile = await GuideProfile.findOne({ userId: req.user._id });
  const booking = await Booking.findById(req.params.id);

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  if (
    !guideProfile ||
    booking.guideId.toString() !== guideProfile._id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "You can only complete your own bookings" });
  }

  booking.status = "completed";
  await booking.save();

  const populated = await Booking.findById(booking._id).populate(
    populateBooking,
  );

  return res
    .status(200)
    .json({ message: "Booking completed", booking: populated });
};

export const getBookingById = async (req, res) => {
  const booking = await Booking.findById(req.params.id).populate(
    populateBooking,
  );

  if (!booking) {
    return res.status(404).json({ message: "Booking not found" });
  }

  const guideProfile =
    req.user.role === "guide"
      ? await GuideProfile.findOne({ userId: req.user._id })
      : null;
  const canView =
    booking.travelerId._id.toString() === req.user._id.toString() ||
    (guideProfile &&
      booking.guideId._id.toString() === guideProfile._id.toString());

  if (!canView) {
    return res.status(403).json({ message: "You cannot view this booking" });
  }

  return res.status(200).json({ booking });
};
