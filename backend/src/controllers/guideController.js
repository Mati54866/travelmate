import GuideProfile from "../models/GuideProfile.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import { getDefaultAvatarForGender, isDefaultAvatar } from "../utils/defaultAvatar.js";
import { getPagination } from "../utils/pagination.js";

export const getGuides = async (req, res) => {
  const { city, specialty, rating, minPrice, maxPrice, search } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = {};
  const hasMinPrice = typeof minPrice !== "undefined" && minPrice !== "";
  const hasMaxPrice = typeof maxPrice !== "undefined" && maxPrice !== "";
  const hasRating = typeof rating !== "undefined" && rating !== "";

  if (city) {
    query.operatingCities = { $in: [new RegExp(city, "i")] };
  }

  if (specialty) {
    query.specialties = { $in: [new RegExp(specialty, "i")] };
  }

  if (hasRating) {
    query.rating = { $gte: Number(rating) };
  }

  if (hasMinPrice || hasMaxPrice) {
    query.hourlyRate = {};
    if (hasMinPrice) query.hourlyRate.$gte = Number(minPrice);
    if (hasMaxPrice) query.hourlyRate.$lte = Number(maxPrice);
  }

  if (search) {
    query.$or = [
      { bio: { $regex: search, $options: "i" } },
      { specialties: { $elemMatch: { $regex: search, $options: "i" } } },
      { operatingCities: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
  }

  const [guides, total] = await Promise.all([
    GuideProfile.find(query)
      .populate("userId", "name email avatar gender role createdAt")
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    GuideProfile.countDocuments(query),
  ]);

  return res.status(200).json({
    guides,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getGuideById = async (req, res) => {
  const guide = await GuideProfile.findById(req.params.id).populate(
    "userId",
    "name email avatar gender role createdAt",
  );

  if (!guide) {
    return res.status(404).json({ message: "Guide not found" });
  }

  return res.status(200).json({ guide });
};

export const getMyGuideProfile = async (req, res) => {
  const guide = await GuideProfile.findOne({ userId: req.user._id }).populate(
    "userId",
    "name email avatar gender role createdAt",
  );

  if (!guide) {
    return res.status(404).json({ message: "Guide profile not found" });
  }

  return res.status(200).json({ guide });
};

export const getGuideTours = async (req, res) => {
  const tours = await Tour.find({
    guideId: req.params.id,
    status: "active",
  }).sort({ createdAt: -1 });
  return res.status(200).json({ tours });
};

export const getGuideReviews = async (req, res) => {
  const reviews = await Review.find({ guideId: req.params.id })
    .populate("travelerId", "name avatar gender")
    .sort({ createdAt: -1 });
  return res.status(200).json({ reviews });
};

export const createGuideProfile = async (req, res) => {
  const { gender, ...guidePayload } = req.body;
  const existing = await GuideProfile.findOne({ userId: req.user._id });

  if (existing) {
    return res.status(409).json({ message: "Guide profile already exists" });
  }

  if (gender) {
    req.user.gender = gender;
    if (!req.user.avatar || isDefaultAvatar(req.user.avatar)) {
      req.user.avatar = getDefaultAvatarForGender(gender);
    }
    await req.user.save();
  }

  const guide = await GuideProfile.create({
    ...guidePayload,
    userId: req.user._id,
    verificationStatus: "verified",
  });

  return res.status(201).json({ message: "Guide profile created", guide });
};

export const updateGuideProfile = async (req, res) => {
  const { gender, ...guidePayload } = req.body;
  const guide = await GuideProfile.findOne({ userId: req.user._id });

  if (!guide) {
    return res.status(404).json({ message: "Guide profile not found" });
  }

  if (gender) {
    req.user.gender = gender;
    if (!req.user.avatar || isDefaultAvatar(req.user.avatar)) {
      req.user.avatar = getDefaultAvatarForGender(gender);
    }
    await req.user.save();
  }

  Object.assign(guide, guidePayload);
  guide.verificationStatus = "verified";
  await guide.save();

  return res.status(200).json({ message: "Guide profile updated", guide });
};

export const toggleAvailability = async (req, res) => {
  const guide = await GuideProfile.findOne({ userId: req.user._id });

  if (!guide) {
    return res.status(404).json({ message: "Guide profile not found" });
  }

  guide.isAvailable = !guide.isAvailable;
  await guide.save();

  return res.status(200).json({
    message: `Availability updated to ${guide.isAvailable ? "available" : "unavailable"}`,
    guide,
  });
};
