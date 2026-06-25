import { body } from "express-validator";

export const createBookingValidator = [
  body("tourId").notEmpty().withMessage("Tour is required"),
  body("bookingDate").isISO8601().withMessage("A valid booking date is required"),
  body("numberOfTravelers").isInt({ min: 1 }).withMessage("Traveler count must be at least 1"),
  body("specialRequests").optional().isString()
];
