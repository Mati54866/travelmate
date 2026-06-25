import { body } from "express-validator";

const sharedGuideValidation = [
  body("bio").trim().notEmpty().withMessage("Bio is required"),
  body("languages").isArray({ min: 1 }).withMessage("At least one language is required"),
  body("specialties").optional().isArray(),
  body("hourlyRate").isFloat({ min: 5, max: 500 }).withMessage("Hourly rate must be between 5 and 500"),
  body("operatingCities").isArray({ min: 1 }).withMessage("At least one city is required"),
  body("yearsOfExperience").optional().isInt({ min: 0 }).withMessage("Experience must be positive"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender")
];

export const createGuideProfileValidator = sharedGuideValidation;
export const updateGuideProfileValidator = sharedGuideValidation.map((validator) => validator.optional());
