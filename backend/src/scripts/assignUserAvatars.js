import "dotenv/config";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { deleteFromImageKit } from "../utils/imagekitUpload.js";

const avatarManifestPath = fileURLToPath(
  new URL("../../../frontend/src/data/avatarGallery.json", import.meta.url),
);

const loadAvatarManifest = async () => {
  const raw = await readFile(avatarManifestPath, "utf8");
  return JSON.parse(raw);
};

const assignUserAvatars = async () => {
  await connectDB(process.env.MONGO_URI);

  const avatars = await loadAvatarManifest();
  const avatarBuckets = avatars.reduce(
    (accumulator, avatar) => {
      accumulator[avatar.gender].push(avatar.src);
      return accumulator;
    },
    { male: [], female: [] },
  );
  const avatarIndexes = { male: 0, female: 0 };

  const users = await User.find({
    role: { $in: ["guide", "traveler"] },
  }).sort({ createdAt: 1 });

  let updatedCount = 0;

  for (const user of users) {
    const bucket =
      avatarBuckets[user.gender] ||
      avatars.map((avatar) => avatar.src);
    if (!bucket.length) {
      continue;
    }

    const currentIndex = avatarIndexes[user.gender] || 0;
    const nextAvatar = bucket[currentIndex % bucket.length];
    avatarIndexes[user.gender] = currentIndex + 1;

    if (user.avatarPublicId && user.avatarPublicId !== "") {
      try {
        await deleteFromImageKit(user.avatarPublicId);
      } catch {
        // Ignore cleanup failures during backfill.
      }
    }

    user.avatar = nextAvatar;
    user.avatarPublicId = "";
    await user.save();
    updatedCount += 1;
  }

  console.log(`Assigned avatars for ${updatedCount} users`);
  process.exit(0);
};

assignUserAvatars().catch((error) => {
  console.error("Avatar assignment failed", error);
  process.exit(1);
});
