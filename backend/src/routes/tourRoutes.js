import express from "express";
import {
  createTour,
  deleteTour,
  getMyTours,
  getTourById,
  getTours,
  updateTour
} from "../controllers/tourController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";
import { createTourValidator, updateTourValidator } from "../validators/tourValidators.js";

const router = express.Router();

router.get("/guide/my-tours", protect, authorize("guide"), getMyTours);
router.get("/", getTours);
router.get("/:id", getTourById);
router.post("/", protect, authorize("guide"), createTourValidator, validate, createTour);
router.put("/:id", protect, authorize("guide"), updateTourValidator, validate, updateTour);
router.delete("/:id", protect, authorize("guide"), deleteTour);

export default router;
