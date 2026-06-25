import express from "express";
import {
  createReview,
  deleteReview,
  getGuideReviews,
  getMyReviews,
  updateReview
} from "../controllers/reviewController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import { createReviewValidator, updateReviewValidator } from "../validators/reviewValidators.js";

const router = express.Router();

router.post("/", protect, authorize("traveler"), createReviewValidator, validate, createReview);
router.get("/guide/:guideId", getGuideReviews);
router.put("/:id", protect, authorize("traveler"), updateReviewValidator, validate, updateReview);
router.delete("/:id", protect, authorize("traveler"), deleteReview);
router.get("/my-reviews", protect, authorize("traveler"), getMyReviews);

export default router;
