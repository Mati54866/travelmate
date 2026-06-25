import { body } from "express-validator";

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const createTourValidator = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("duration").isFloat({ min: 1 }).withMessage("Duration is required"),
  body("pricePerPerson").isFloat({ min: 1 }).withMessage("Price is required"),
  body("maxGroupSize")
    .isInt({ min: 1, max: 20 })
    .withMessage("Group size must be 1-20"),
  body("meetingPoint")
    .trim()
    .notEmpty()
    .withMessage("Meeting point is required"),
  body("includedItems").optional().isArray(),
  body("excludedItems").optional().isArray(),
  body("images").optional().isArray(),
  body("imagePublicIds").optional().isArray(),
  body("highlights").optional().isArray(),
  body("availableDates").optional().isArray(),
  // allow different date formats: ISO strings, epoch numbers, or small numeric offsets
  body("availableDates.*")
    .optional()
    .custom((value) => {
      if (value == null) return true;
      // numeric values (epoch ms or small offsets) are allowed here — controller will normalize
      if (typeof value === "number") return true;
      if (typeof value === "string" && /^\d+$/.test(value)) return true;
      // otherwise ensure it's a parseable date string
      const d = new Date(value);
      if (Number.isNaN(d.getTime()))
        throw new Error("Each available date must be a valid date");
      return true;
    }),
  body("status").optional().isIn(["active", "inactive"]),
];

export const updateTourValidator = createTourValidator.map((validator) =>
  validator.optional(),
);
