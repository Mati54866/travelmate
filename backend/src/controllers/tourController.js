import GuideProfile from "../models/GuideProfile.js";
import Tour from "../models/Tour.js";
import { getPagination } from "../utils/pagination.js";

const getGuideProfileForUser = async (userId) =>
  GuideProfile.findOne({ userId });

const normalizeTourPayload = (payload = {}) => {
  const nextPayload = { ...payload };

  if (Array.isArray(nextPayload.availableDates)) {
    const today = new Date();
    nextPayload.availableDates = nextPayload.availableDates
      .map((raw) => {
        // Support several input formats:
        // - ISO date strings
        // - numeric epoch milliseconds
        // - small numeric offsets (seed data like 4 -> 4 days from today)
        if (raw == null) return null;
        // if already a Date
        if (raw instanceof Date) return raw;

        // if number-like string, convert
        const maybeNumber =
          typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : null;
        const value = maybeNumber != null ? maybeNumber : raw;

        if (typeof value === "number") {
          // epoch ms (large number)
          if (value > 1000000000000) {
            return new Date(value);
          }
          // small number -> treat as day offset
          const d = new Date();
          d.setDate(d.getDate() + Number(value));
          d.setHours(10, 0, 0, 0);
          return d;
        }

        // try dd-mm-yy or dd-mm-yyyy (common user input)
        if (typeof value === "string") {
          const dm = value.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
          if (dm) {
            const day = Number(dm[1]);
            const month = Number(dm[2]);
            let year = Number(dm[3]);
            if (dm[3].length === 2) year = 2000 + year;
            const d = new Date(year, month - 1, day, 10, 0, 0, 0);
            if (!Number.isNaN(d.getTime())) return d;
          }
        }

        // fallback: parse as date string
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) return parsed;
        return null;
      })
      .filter((date) => !!date && !Number.isNaN(date.getTime()));
  }

  return nextPayload;
};

export const getTours = async (req, res) => {
  const {
    city,
    minPrice,
    maxPrice,
    date,
    guideId,
    status = "active",
    search,
  } = req.query;
  const { page, limit, skip } = getPagination(req.query);
  const query = {};

  if (guideId) {
    query.guideId = guideId;
  }

  if (status) {
    query.status = status;
  }

  if (typeof minPrice !== "undefined" || typeof maxPrice !== "undefined") {
    query.pricePerPerson = {};
    if (minPrice) query.pricePerPerson.$gte = Number(minPrice);
    if (maxPrice) query.pricePerPerson.$lte = Number(maxPrice);
  }

  if (date) {
    const selected = new Date(date);
    query.availableDates = {
      $elemMatch: {
        $gte: new Date(selected.setHours(0, 0, 0, 0)),
        $lte: new Date(selected.setHours(23, 59, 59, 999)),
      },
    };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { highlights: { $elemMatch: { $regex: search, $options: "i" } } },
    ];
  }

  let guidesByCity = null;

  if (city) {
    const guides = await GuideProfile.find({
      operatingCities: { $elemMatch: { $regex: city, $options: "i" } },
    }).select("_id");
    guidesByCity = guides.map((guide) => guide._id);
    query.guideId = { $in: guidesByCity };
  }

  const [tours, total] = await Promise.all([
    Tour.find(query)
      .populate({
        path: "guideId",
        populate: {
          path: "userId",
          select: "name avatar gender",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Tour.countDocuments(query),
  ]);

  return res.status(200).json({
    tours,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getTourById = async (req, res) => {
  const tour = await Tour.findById(req.params.id).populate({
    path: "guideId",
    populate: {
      path: "userId",
      select: "name avatar gender email",
    },
  });

  if (!tour) {
    return res.status(404).json({ message: "Tour not found" });
  }

  return res.status(200).json({ tour });
};

export const createTour = async (req, res) => {
  const guideProfile = await getGuideProfileForUser(req.user._id);

  if (!guideProfile) {
    return res.status(400).json({ message: "Create your guide profile first" });
  }

  const payload = normalizeTourPayload(req.body);

  // Ensure no past dates
  if (Array.isArray(payload.availableDates)) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (payload.availableDates.some((d) => d < startOfToday)) {
      return res
        .status(400)
        .json({ message: "Available dates cannot be in the past" });
    }
  }

  const tour = await Tour.create({
    ...payload,
    guideId: guideProfile._id,
  });

  return res.status(201).json({ message: "Tour created", tour });
};

export const updateTour = async (req, res) => {
  const guideProfile = await getGuideProfileForUser(req.user._id);
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({ message: "Tour not found" });
  }

  if (
    !guideProfile ||
    tour.guideId.toString() !== guideProfile._id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "You can only update your own tours" });
  }

  Object.assign(tour, normalizeTourPayload(req.body));
  // after normalization, validate no past dates
  if (Array.isArray(tour.availableDates)) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    if (tour.availableDates.some((d) => d < startOfToday)) {
      return res
        .status(400)
        .json({ message: "Available dates cannot be in the past" });
    }
  }

  await tour.save();

  return res.status(200).json({ message: "Tour updated", tour });
};

export const deleteTour = async (req, res) => {
  const guideProfile = await getGuideProfileForUser(req.user._id);
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return res.status(404).json({ message: "Tour not found" });
  }

  if (
    !guideProfile ||
    tour.guideId.toString() !== guideProfile._id.toString()
  ) {
    return res
      .status(403)
      .json({ message: "You can only delete your own tours" });
  }

  await tour.deleteOne();

  return res.status(200).json({ message: "Tour deleted" });
};

export const getMyTours = async (req, res) => {
  const guideProfile = await getGuideProfileForUser(req.user._id);

  if (!guideProfile) {
    return res.status(200).json({ tours: [] });
  }

  const tours = await Tour.find({ guideId: guideProfile._id }).sort({
    createdAt: -1,
  });

  return res.status(200).json({ tours });
};
