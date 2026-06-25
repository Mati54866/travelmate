import createImageKit from "../config/imagekit.js";

const ensureImageKitConfig = () => {
  if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("ImageKit credentials are missing");
  }
};

const buildOptimizedUrl = (filePath) =>
  createImageKit().url({
    path: filePath,
    transformation: [
      {
        height: 600,
        width: 800,
        crop: "maintain_ratio"
      },
      {
        quality: "80"
      }
    ]
  });

export const uploadBufferToImageKit = async (buffer, folder = "/travelmate") => {
  ensureImageKitConfig();
  const imagekit = createImageKit();

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const uploaded = await imagekit.upload({
    file: buffer,
    fileName,
    folder,
    useUniqueFileName: true
  });

  return {
    ...uploaded,
    optimizedUrl: buildOptimizedUrl(uploaded.filePath)
  };
};

export const deleteFromImageKit = async (fileId) => {
  ensureImageKitConfig();
  return createImageKit().deleteFile(fileId);
};
