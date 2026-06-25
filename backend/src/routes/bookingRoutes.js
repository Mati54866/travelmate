import express from "express";
import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  getBookingById,
  getGuideBookings,
  getMyBookings
} from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import { createBookingValidator } from "../validators/bookingValidators.js";

const router = express.Router();

router.post("/", protect, authorize("traveler"), createBookingValidator, validate, createBooking);
router.get("/my-bookings", protect, authorize("traveler"), getMyBookings);
router.get("/guide-bookings", protect, authorize("guide"), getGuideBookings);
router.put("/:id/confirm", protect, authorize("guide"), confirmBooking);
router.put("/:id/cancel", protect, cancelBooking);
router.put("/:id/complete", protect, authorize("guide"), completeBooking);
router.get("/:id", protect, getBookingById);

export default router;
