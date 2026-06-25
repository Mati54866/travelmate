import express from "express";
import rateLimit from "express-rate-limit";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  googleLogin,
  login,
  register,
  resetPassword,
  updateProfile
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import {
  changePasswordValidator,
  forgotPasswordValidator,
  googleAuthValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updateProfileValidator
} from "../validators/authValidators.js";

const router = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth requests. Please try again later." }
});

router.post("/register", authLimiter, registerValidator, validate, register);
router.post("/login", authLimiter, loginValidator, validate, login);
router.post("/google", authLimiter, googleAuthValidator, validate, googleLogin);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfileValidator, validate, updateProfile);
router.put("/change-password", protect, changePasswordValidator, validate, changePassword);
router.post("/forgot-password", authLimiter, forgotPasswordValidator, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidator, validate, resetPassword);

export default router;
