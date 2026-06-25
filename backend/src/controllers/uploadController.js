import {
  deleteFromImageKit,
  uploadBufferToImageKit,
} from "../utils/imagekitUpload.js";

export const uploadSingleImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Image file is required" });
  }

  try {
    const result = await uploadBufferToImageKit(
      req.file.buffer,
      "/travelmate/avatars",
    );
    return res.status(201).json({
      message: "Image uploaded successfully",
      image: {
        url: result.optimizedUrl,
        publicId: result.fileId,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `ImageKit upload failed: ${error.message}` });
  }
};

export const uploadMultipleImages = async (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ message: "At least one image is required" });
  }

  try {
    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadBufferToImageKit(file.buffer, "/travelmate/tours"),
      ),
    );

    return res.status(201).json({
      message: "Images uploaded successfully",
      images: uploads.map((item) => ({
        url: item.optimizedUrl,
        publicId: item.fileId,
      })),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `ImageKit upload failed: ${error.message}` });
  }
};

export const deleteImage = async (req, res) => {
  try {
    await deleteFromImageKit(decodeURIComponent(req.params.publicId));
    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `ImageKit deletion failed: ${error.message}` });
  }
};
