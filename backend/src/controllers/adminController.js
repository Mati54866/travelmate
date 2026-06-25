import Booking from "../models/Booking.js";
import GuideProfile from "../models/GuideProfile.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";

const userSelect = "name email avatar gender role isActive createdAt updatedAt";

const getOverviewCounts = async () => {
  const [users, guides, tours, bookings, reviews] = await Promise.all([
    User.countDocuments(),
    GuideProfile.countDocuments(),
    Tour.countDocuments(),
    Booking.countDocuments(),
    Review.countDocuments(),
  ]);

  return { users, guides, tours, bookings, reviews };
};

const removeUserData = async (user) => {
  if (!user) return;

  await PasswordResetToken.deleteMany({ userId: user._id });

  if (user.role === "guide") {
    const guideProfile = await GuideProfile.findOne({ userId: user._id });

    if (guideProfile) {
      await Promise.all([
        Review.deleteMany({ guideId: guideProfile._id }),
        Booking.deleteMany({ guideId: guideProfile._id }),
        Tour.deleteMany({ guideId: guideProfile._id }),
        GuideProfile.deleteOne({ _id: guideProfile._id }),
      ]);
    }
  } else {
    await Promise.all([
      Review.deleteMany({ travelerId: user._id }),
      Booking.deleteMany({ travelerId: user._id }),
    ]);
  }

  await User.deleteOne({ _id: user._id });
};

export const getOverview = async (req, res) => {
  const counts = await getOverviewCounts();

  return res.status(200).json({ counts });
};

export const getUsers = async (req, res) => {
  const { role, search } = req.query;
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const users = await User.find(query).sort({ createdAt: -1 }).select(userSelect);

  return res.status(200).json({ users });
};

export const getGuides = async (req, res) => {
  const { search } = req.query;
  const query = {};

  if (search) {
    query.$or = [
      { bio: { $regex: search, $options: "i" } },
      { operatingCities: { $elemMatch: { $regex: search, $options: "i" } } },
      { specialties: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
  }

  const guides = await GuideProfile.find(query)
    .populate("userId", userSelect)
    .sort({ rating: -1, createdAt: -1 });

  const guidesWithStats = await Promise.all(
    guides.map(async (guide) => {
      const [tourCount, bookingCount, reviewCount] = await Promise.all([
        Tour.countDocuments({ guideId: guide._id }),
        Booking.countDocuments({ guideId: guide._id }),
        Review.countDocuments({ guideId: guide._id }),
      ]);

      return {
        ...guide.toObject(),
        stats: {
          tourCount,
          bookingCount,
          reviewCount,
        },
      };
    }),
  );

  return res.status(200).json({ guides: guidesWithStats });
};

export const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  await removeUserData(user);

  return res.status(200).json({ message: "User deleted" });
};

export const deleteGuide = async (req, res) => {
  const guide = await GuideProfile.findById(req.params.id);

  if (!guide) {
    return res.status(404).json({ message: "Guide not found" });
  }

  const user = await User.findById(guide.userId);

  if (!user) {
    await GuideProfile.deleteOne({ _id: guide._id });
    return res.status(200).json({ message: "Guide deleted" });
  }

  if (req.user._id.toString() === user._id.toString()) {
    return res.status(400).json({ message: "You cannot delete your own account" });
  }

  await removeUserData(user);

  return res.status(200).json({ message: "Guide deleted" });
};
