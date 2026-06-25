import express from "express";
import {
  deleteGuide,
  deleteUser,
  getGuides,
  getOverview,
  getUsers,
} from "../controllers/adminController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/overview", getOverview);
router.get("/users", getUsers);
router.get("/guides", getGuides);
router.delete("/users/:id", deleteUser);
router.delete("/guides/:id", deleteGuide);

export default router;
