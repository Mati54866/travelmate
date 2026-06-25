import express from "express";
import {
  createGuideProfile,
  getGuideById,
  getMyGuideProfile,
  getGuideReviews,
  getGuides,
  getGuideTours,
  toggleAvailability,
  updateGuideProfile
} from "../controllers/guideController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import {
  createGuideProfileValidator,
  updateGuideProfileValidator
} from "../validators/guideValidators.js";

const router = express.Router();

router.get("/", getGuides);
router.get("/profile/me", protect, authorize("guide"), getMyGuideProfile);
router.get("/:id", getGuideById);
router.get("/:id/tours", getGuideTours);
router.get("/:id/reviews", getGuideReviews);
router.post("/profile", protect, authorize("guide"), createGuideProfileValidator, validate, createGuideProfile);
router.put("/profile", protect, authorize("guide"), updateGuideProfileValidator, validate, updateGuideProfile);
router.put("/availability", protect, authorize("guide"), toggleAvailability);

export default router;
