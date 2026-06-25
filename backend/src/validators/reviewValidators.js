import { body } from "express-validator";

export const createReviewValidator = [
  body("bookingId").notEmpty().withMessage("Booking is required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").trim().notEmpty().withMessage("Comment is required")
];

export const updateReviewValidator = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().trim().notEmpty().withMessage("Comment cannot be empty")
];
