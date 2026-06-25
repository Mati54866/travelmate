import express from "express";
import { deleteImage, uploadMultipleImages, uploadSingleImage } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/image", protect, upload.single("image"), uploadSingleImage);
router.post("/images", protect, upload.array("images", 6), uploadMultipleImages);
router.delete("/image/:publicId", protect, deleteImage);

export default router;
