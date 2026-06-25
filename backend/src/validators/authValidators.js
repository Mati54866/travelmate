import { body } from "express-validator";

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["traveler", "guide"]).withMessage("Invalid role"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender")
];

export const loginValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required")
];

export const googleAuthValidator = [
  body("credential").notEmpty().withMessage("Google credential is required"),
  body("role").optional().isIn(["traveler", "guide"]).withMessage("Invalid role"),
  body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender")
];

export const updateProfileValidator = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("avatar").optional().isString(),
  body("avatarPublicId").optional().isString(),
  body("gender").optional().isIn(["male", "female"]).withMessage("Invalid gender")
];

export const changePasswordValidator = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters")
];

export const forgotPasswordValidator = [
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail()
];

export const resetPasswordValidator = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
];
