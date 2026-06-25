import "dotenv/config";
import crypto from "crypto";
import { readFile, readdir } from "fs/promises";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Booking from "../models/Booking.js";
import GuideProfile from "../models/GuideProfile.js";
import PasswordResetToken from "../models/PasswordResetToken.js";
import Review from "../models/Review.js";
import Tour from "../models/Tour.js";
import User from "../models/User.js";
import createImageKit from "../config/imagekit.js";
import syncGuideRating from "../utils/guideRating.js";
import { uploadBufferToImageKit } from "../utils/imagekitUpload.js";

const asset = (filename) => `/assets/${filename}`;
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, "../../..");
const imageKit = createImageKit();

const avatarPalette = [
  ["#0f172a", "#75d780"],
  ["#10243d", "#6da7ff"],
  ["#24113c", "#d48cff"],
  ["#102c2a", "#62e0c8"],
  ["#3a1c0f", "#ffbf7a"],
  ["#13251f", "#a3f7b5"],
];

let tourImageUrls = [];

const buildAvatarDataUrl = (name, index, gender = "male") => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const palette = avatarPalette[index % avatarPalette.length];
  const accent = gender === "female" ? "#f4b7ff" : "#a6e3ff";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="100%" stop-color="${palette[1]}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" rx="72" fill="url(#bg)"/>
      <circle cx="200" cy="160" r="70" fill="rgba(255,255,255,0.16)"/>
      <path d="M108 332c14-53 49-84 92-84s78 31 92 84" fill="rgba(255,255,255,0.16)"/>
      <circle cx="200" cy="206" r="120" fill="none" stroke="${accent}" stroke-opacity="0.25" stroke-width="2"/>
      <text x="200" y="225" text-anchor="middle" font-family="Arial, sans-serif" font-size="96" font-weight="700" fill="#ffffff">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const buildTourVariantUrl = (filePath, variant) =>
  imageKit.url({
    path: filePath,
    transformation: [
      {
        width: variant.width,
        height: variant.height,
        crop: "maintain_ratio",
      },
      {
        quality: "80",
      },
    ],
  });

const guideAvatars = [
  asset("femaleAvatar.avif"),
  asset("avatar.avif"),
  asset("femaleAvatar1.avif"),
  asset("avatar1.avif"),
  asset("femaleAvatar2.avif"),
  asset("avatar2.avif"),
];

const tourImageSets = [
  [asset("hero.png"), asset("feturedTour.avif"), asset("dashboard1.avif")],
  [asset("dashboard2.avif"), asset("cityBeach.avif"), asset("beach.avif")],
  [asset("dashboard3.avif"), asset("gatewall.avif"), asset("temple.avif")],
  [asset("dashboard4.avif"), asset("island.avif"), asset("wave.avif")],
  [asset("dashboard5.avif"), asset("templeBig.webp"), asset("statue.avif")],
  [asset("dashboard6.avif"), asset("tokyo.avif"), asset("london.avif")],
  [asset("capeTown.avif"), asset("bolive.avif"), asset("plane.avif")],
  [asset("tourist.avif"), asset("cityBeach.avif"), asset("gatewall.avif")],
  [asset("hero.png"), asset("beach.avif"), asset("feturedTour.avif")],
  [asset("wave.avif"), asset("island.avif"), asset("london.avif")],
];

const guideSeeds = [
  {
    name: "Ayu Putri",
    email: "ayu.putri@travelmate.demo",
    gender: "female",
    city: "Bali",
    avatar: guideAvatars[0],
    bio: "I design polished Bali itineraries with sunrise temples, calm breakfast stops, and coastal evenings that feel easy to trust.",
    languages: ["English", "Bahasa Indonesia"],
    specialties: ["Temple Tours", "Wellness", "Photography"],
    hourlyRate: 58,
    yearsOfExperience: 8,
    operatingCities: ["Ubud", "Canggu", "Uluwatu"],
    meetingPoints: ["Ubud Palace main entrance", "Batu Bolong beachfront"],
    focusPoints: ["sunrise temples", "rice terraces", "coastal viewpoints"],
  },
  {
    name: "Marco Bellini",
    email: "marco.bellini@travelmate.demo",
    gender: "male",
    city: "Rome",
    avatar: guideAvatars[1],
    bio: "I build calm Rome routes that blend classical landmarks, neighborhood trattorias, and practical pacing for first-time visitors.",
    languages: ["English", "Italian", "Spanish"],
    specialties: ["City Tours", "Food Tours", "History"],
    hourlyRate: 72,
    yearsOfExperience: 11,
    operatingCities: ["Rome", "Florence", "Vatican City"],
    meetingPoints: ["Colosseo metro exit", "Piazza Navona fountain"],
    focusPoints: ["Colosseum walks", "trattorias", "hidden alleys"],
  },
  {
    name: "Layla Hassan",
    email: "layla.hassan@travelmate.demo",
    gender: "female",
    city: "Marrakech",
    avatar: guideAvatars[2],
    bio: "I guide sensory Marrakech days through the medina, rooftop tea stops, and markets that feel organized instead of overwhelming.",
    languages: ["English", "Arabic", "French"],
    specialties: ["Food Tours", "Markets", "Culture"],
    hourlyRate: 63,
    yearsOfExperience: 6,
    operatingCities: ["Marrakech", "Casablanca", "Essaouira"],
    meetingPoints: ["Koutoubia Mosque gardens", "Jemaa el-Fnaa square"],
    focusPoints: ["medina lanes", "spice markets", "rooftop tea"],
  },
  {
    name: "Deniz Kaya",
    email: "deniz.kaya@travelmate.demo",
    gender: "male",
    city: "Istanbul",
    avatar: guideAvatars[3],
    bio: "I keep Istanbul easy to navigate with thoughtful routes through mosques, bazaars, ferry piers, and shoreline viewpoints.",
    languages: ["English", "Turkish"],
    specialties: ["City Tours", "Architecture", "Food Tours"],
    hourlyRate: 68,
    yearsOfExperience: 9,
    operatingCities: ["Istanbul", "Bursa", "Cappadocia"],
    meetingPoints: ["Sultanahmet tram station", "Eminonu ferry pier"],
    focusPoints: ["historic mosques", "bazaars", "Bosphorus ferries"],
  },
  {
    name: "Sora Tanaka",
    email: "sora.tanaka@travelmate.demo",
    gender: "female",
    city: "Tokyo",
    avatar: guideAvatars[4],
    bio: "I guide travelers through Tokyo with clean pacing, from shrine mornings to neon evenings and neighborhood coffee stops.",
    languages: ["English", "Japanese"],
    specialties: ["City Tours", "Night Tours", "Food Tours"],
    hourlyRate: 88,
    yearsOfExperience: 10,
    operatingCities: ["Tokyo", "Kyoto", "Osaka"],
    meetingPoints: ["Shibuya Scramble corner", "Harajuku station exit"],
    focusPoints: ["shrine visits", "neon districts", "coffee bars"],
  },
  {
    name: "Noah Bennett",
    email: "noah.bennett@travelmate.demo",
    gender: "male",
    city: "London",
    avatar: guideAvatars[5],
    bio: "I run practical London routes that balance landmarks, market lanes, and quieter riverside breaks between the must-sees.",
    languages: ["English"],
    specialties: ["City Tours", "Markets", "Photography"],
    hourlyRate: 74,
    yearsOfExperience: 7,
    operatingCities: ["London", "Bath", "Oxford"],
    meetingPoints: ["Westminster station exit 1", "Borough Market Southwark Gate"],
    focusPoints: ["landmarks", "market lanes", "riverside walks"],
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@travelmate.demo",
    gender: "female",
    city: "Jaipur",
    avatar: guideAvatars[0],
    bio: "I shape Jaipur days around forts, craft markets, and chai stops so the city feels colorful, organized, and easy to enjoy.",
    languages: ["English", "Hindi"],
    specialties: ["Heritage", "Markets", "Food Tours"],
    hourlyRate: 55,
    yearsOfExperience: 8,
    operatingCities: ["Jaipur", "Delhi", "Agra"],
    meetingPoints: ["Hawa Mahal forecourt", "Amber Fort parking"],
    focusPoints: ["pink city forts", "craft markets", "chai stops"],
  },
  {
    name: "Elena Petrova",
    email: "elena.petrova@travelmate.demo",
    gender: "female",
    city: "Prague",
    avatar: guideAvatars[2],
    bio: "I create polished Prague walks through the old town, river bridges, and cafe stops that keep the day moving comfortably.",
    languages: ["English", "Czech", "Russian"],
    specialties: ["City Tours", "Architecture", "Cafes"],
    hourlyRate: 61,
    yearsOfExperience: 9,
    operatingCities: ["Prague", "Brno", "Karlovy Vary"],
    meetingPoints: ["Old Town Square clock corner", "Charles Bridge tower"],
    focusPoints: ["old town squares", "bridges", "cafe culture"],
  },
  {
    name: "Amara Okafor",
    email: "amara.okafor@travelmate.demo",
    gender: "female",
    city: "Cape Town",
    avatar: guideAvatars[4],
    bio: "I keep Cape Town itineraries relaxed and premium with mountain views, coastal drives, and vineyard stops.",
    languages: ["English", "Afrikaans"],
    specialties: ["Scenic Tours", "Wine", "Coastlines"],
    hourlyRate: 79,
    yearsOfExperience: 10,
    operatingCities: ["Cape Town", "Stellenbosch", "Hermanus"],
    meetingPoints: ["V&A Waterfront clock tower", "Bo-Kaap museum steps"],
    focusPoints: ["Table Mountain views", "coast drives", "vineyard stops"],
  },
  {
    name: "Lucas Moreau",
    email: "lucas.moreau@travelmate.demo",
    gender: "male",
    city: "Paris",
    avatar: guideAvatars[1],
    bio: "I guide well-paced Paris days with museum blocks, river walks, and neighborhood bistro stops that keep the itinerary refined.",
    languages: ["English", "French"],
    specialties: ["City Tours", "Art", "Food Tours"],
    hourlyRate: 83,
    yearsOfExperience: 12,
    operatingCities: ["Paris", "Versailles", "Lyon"],
    meetingPoints: ["Louvre pyramid", "Pont Neuf bridge"],
    focusPoints: ["museum routes", "river walks", "bistro stops"],
  },
  {
    name: "Sofia Andersson",
    email: "sofia.andersson@travelmate.demo",
    gender: "female",
    city: "Stockholm",
    avatar: guideAvatars[0],
    bio: "I build Stockholm days around design districts, archipelago walks, and fika breaks that feel polished and unhurried.",
    languages: ["English", "Swedish"],
    specialties: ["City Tours", "Design", "Photography"],
    hourlyRate: 69,
    yearsOfExperience: 7,
    operatingCities: ["Stockholm", "Uppsala", "Gothenburg"],
    meetingPoints: ["Gamla Stan tunnelbana exit", "Nybroplan tram stop"],
    focusPoints: ["archipelago walks", "design districts", "fika breaks"],
  },
  {
    name: "Mateo Silva",
    email: "mateo.silva@travelmate.demo",
    gender: "male",
    city: "Lisbon",
    avatar: guideAvatars[3],
    bio: "I guide Lisbon routes through tram climbs, azulejo lanes, and ocean views with a steady pace that suits first-time travelers.",
    languages: ["English", "Portuguese", "Spanish"],
    specialties: ["City Tours", "Food Tours", "Views"],
    hourlyRate: 64,
    yearsOfExperience: 9,
    operatingCities: ["Lisbon", "Sintra", "Porto"],
    meetingPoints: ["Rossio station stairs", "Belém tower plaza"],
    focusPoints: ["tram climbs", "azulejo lanes", "ocean views"],
  },
  {
    name: "Hana Kim",
    email: "hana.kim@travelmate.demo",
    gender: "female",
    city: "Seoul",
    avatar: guideAvatars[5],
    bio: "I make Seoul feel easy with palace mornings, night market tastings, and modern district stops that stay organized from start to finish.",
    languages: ["English", "Korean"],
    specialties: ["City Tours", "Food Tours", "Night Markets"],
    hourlyRate: 71,
    yearsOfExperience: 8,
    operatingCities: ["Seoul", "Busan", "Jeju"],
    meetingPoints: ["Gyeongbokgung main gate", "Hongdae subway exit 9"],
    focusPoints: ["palaces", "night markets", "modern districts"],
  },
  {
    name: "Omar Haddad",
    email: "omar.haddad@travelmate.demo",
    gender: "male",
    city: "Amman",
    avatar: guideAvatars[1],
    bio: "I keep Amman itineraries practical and polished with citadel views, souq stops, and cultural streets that are simple to follow.",
    languages: ["English", "Arabic"],
    specialties: ["City Tours", "Culture", "History"],
    hourlyRate: 57,
    yearsOfExperience: 7,
    operatingCities: ["Amman", "Jerash", "Aqaba"],
    meetingPoints: ["Roman Theater steps", "Rainbow Street arches"],
    focusPoints: ["citadel views", "souq stops", "cultural streets"],
  },
  {
    name: "Isla Campbell",
    email: "isla.campbell@travelmate.demo",
    gender: "female",
    city: "Edinburgh",
    avatar: guideAvatars[2],
    bio: "I design Edinburgh walks that move cleanly between castle routes, old town closes, and calm whisky stops.",
    languages: ["English"],
    specialties: ["City Tours", "History", "Food Tours"],
    hourlyRate: 66,
    yearsOfExperience: 8,
    operatingCities: ["Edinburgh", "Glasgow", "Stirling"],
    meetingPoints: ["Royal Mile Mercat Cross", "Edinburgh Castle esplanade"],
    focusPoints: ["castle routes", "old town closes", "whisky stops"],
  },
  {
    name: "Yuki Sato",
    email: "yuki.sato@travelmate.demo",
    gender: "female",
    city: "Kyoto",
    avatar: guideAvatars[4],
    bio: "I guide Kyoto through shrine mornings, tea houses, and garden lanes with a refined pace that feels easy to book.",
    languages: ["English", "Japanese"],
    specialties: ["Heritage", "Tea", "Photography"],
    hourlyRate: 77,
    yearsOfExperience: 10,
    operatingCities: ["Kyoto", "Osaka", "Nara"],
    meetingPoints: ["Gion corner", "Kiyomizu-dera ticket gate"],
    focusPoints: ["shrines", "tea houses", "garden lanes"],
  },
  {
    name: "Nia Morgan",
    email: "nia.morgan@travelmate.demo",
    gender: "female",
    city: "Dublin",
    avatar: guideAvatars[0],
    bio: "I keep Dublin simple and memorable with historic pubs, river quays, and literary walks that feel naturally paced.",
    languages: ["English"],
    specialties: ["City Tours", "Culture", "Storytelling"],
    hourlyRate: 62,
    yearsOfExperience: 6,
    operatingCities: ["Dublin", "Cork", "Galway"],
    meetingPoints: ["Trinity College front gate", "Temple Bar entrance"],
    focusPoints: ["historic pubs", "river quays", "literary walks"],
  },
  {
    name: "Rafael Costa",
    email: "rafael.costa@travelmate.demo",
    gender: "male",
    city: "Rio de Janeiro",
    avatar: guideAvatars[3],
    bio: "I build Rio days around beaches, mountain viewpoints, and music stops so the route feels lively but still organized.",
    languages: ["English", "Portuguese", "Spanish"],
    specialties: ["Beach Tours", "Music", "Views"],
    hourlyRate: 73,
    yearsOfExperience: 9,
    operatingCities: ["Rio de Janeiro", "Sao Paulo", "Paraty"],
    meetingPoints: ["Copacabana promenade", "Sugarloaf cable car base"],
    focusPoints: ["beaches", "mountain views", "music stops"],
  },
  {
    name: "Mei Lin",
    email: "mei.lin@travelmate.demo",
    gender: "female",
    city: "Singapore",
    avatar: guideAvatars[5],
    bio: "I guide Singapore with polished hawker center routes, garden visits, and marina views that work well for busy travelers.",
    languages: ["English", "Mandarin"],
    specialties: ["Food Tours", "Gardens", "City Tours"],
    hourlyRate: 80,
    yearsOfExperience: 7,
    operatingCities: ["Singapore", "Johor Bahru", "Batu Pahat"],
    meetingPoints: ["Marina Bay Sands promenade", "Chinatown MRT exit A"],
    focusPoints: ["hawker centers", "gardens", "marina views"],
  },
  {
    name: "Daniel Reed",
    email: "daniel.reed@travelmate.demo",
    gender: "male",
    city: "New York",
    avatar: guideAvatars[1],
    bio: "I keep New York itineraries efficient with skyline viewpoints, neighborhood food, and museum blocks that never feel scattered.",
    languages: ["English"],
    specialties: ["City Tours", "Food Tours", "Photography"],
    hourlyRate: 86,
    yearsOfExperience: 11,
    operatingCities: ["New York", "Boston", "Philadelphia"],
    meetingPoints: ["Times Square south plaza", "Brooklyn Bridge Park"],
    focusPoints: ["skyline viewpoints", "neighborhood food", "museum blocks"],
  },
];

const travelerNames = [
  "Aiden Brooks",
  "Nora Evans",
  "Liam Carter",
  "Maya Patel",
  "Ethan Nguyen",
  "Chloe Turner",
  "Omar Ali",
  "Sofia Martinez",
  "Daniel Kim",
  "Grace Hill",
  "Lucas Stone",
  "Isla Reed",
  "Aria Bennett",
  "Noah Foster",
  "Mia Johnson",
  "Leo Walker",
  "Zara Khan",
  "Ryan Clarke",
  "Ella Price",
  "Ben Cooper",
  "Nina Gomez",
  "Jack Murphy",
  "Lila Singh",
  "Hugo Wright",
  "Ava Scott",
  "Theo Allen",
  "Sara Young",
  "Omar Hassan",
  "Emma Bailey",
  "Max Thompson",
];

const specialRequests = [
  "Window seats if available",
  "Please keep the route photo-friendly",
  "Vegetarian tasting options preferred",
  "A slower pace would be ideal",
  "We would love a short coffee stop",
  "Any local market recommendations are welcome",
];

const makeDateAtHour = (date, hour = 10) => {
  const nextDate = new Date(date);
  nextDate.setHours(hour, 0, 0, 0);
  return nextDate;
};

const futureDates = (seedOffset, count = 6, gap = 4) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + seedOffset + index * gap);
    return makeDateAtHour(date, 10);
  });

const pastDate = (seedOffset) => {
  const date = new Date();
  date.setDate(date.getDate() - seedOffset);
  return makeDateAtHour(date, 10);
};

const collectUniqueTourSources = async () => {
  const assetDirectories = [path.resolve(repoRoot, "frontend/public/assets")];

  const uniqueSources = [];
  const seenHashes = new Set();

  for (const directory of assetDirectories) {
    const names = await readdir(directory);
    names.sort((left, right) => left.localeCompare(right));

    for (const name of names) {
      if (/avatar/i.test(name)) {
        continue;
      }

      const filePath = path.resolve(directory, name);
      const fileBuffer = await readFile(filePath);
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      if (seenHashes.has(hash)) {
        continue;
      }

      seenHashes.add(hash);
      uniqueSources.push({ filePath, fileBuffer });
    }
  }

  return uniqueSources;
};

const buildTourImageUrls = async () => {
  const uniqueSources = await collectUniqueTourSources();

  if (uniqueSources.length < 33) {
    throw new Error("Not enough unique local tour images were found");
  }

  const uploads = [];

  for (const source of uniqueSources.slice(0, 33)) {
    const uploaded = await uploadBufferToImageKit(source.fileBuffer, "/travelmate/tours");
    uploads.push(uploaded);
  }

  const variantWidths = [
    { width: 1920, height: 1088 },
    { width: 1680, height: 1056 },
    { width: 1600, height: 1024 },
    { width: 1536, height: 960 },
    { width: 1440, height: 896 },
    { width: 1376, height: 896 },
    { width: 1280, height: 960 },
  ];

  return [
    ...uploads.map((item) => item.optimizedUrl),
    ...variantWidths.map((variant, index) =>
      buildTourVariantUrl(uploads[index].filePath, variant),
    ),
  ];
};

const buildTour = (guide, guideIndex, tourIndex) => {
  const isPrimaryTour = tourIndex === 0;
  const focusPoints = guide.focusPoints;
  const images = [tourImageUrls[guideIndex * 2 + tourIndex]];
  const availableDates = futureDates(4 + guideIndex * 2 + tourIndex * 3);
  const duration = isPrimaryTour ? 7 + (guideIndex % 3) : 5 + (guideIndex % 4);
  const basePrice = guide.hourlyRate * (isPrimaryTour ? 2.3 : 1.8);

  return {
    title: `${guide.city} ${isPrimaryTour ? "Sunrise Heritage Loop" : "Evening Tastes and Skyline Walk"}`,
    description: isPrimaryTour
      ? `A carefully paced early route through ${focusPoints[0]}, ${focusPoints[1]}, and a polished breakfast stop that keeps the day easy to enjoy.`
      : `A refined late-day route built around ${focusPoints[1]}, ${focusPoints[2]}, and a local tasting finish with strong city context.`,
    duration,
    pricePerPerson: Math.round(basePrice + guideIndex * 4 + tourIndex * 18),
    maxGroupSize: 6 + (guideIndex % 5),
    includedItems: isPrimaryTour
      ? ["Guide support", "Breakfast stop", "Photo planning"]
      : ["Route notes", "Local tasting stop", "Evening coordination"],
    excludedItems: ["Personal shopping", "Optional entry fees"],
    meetingPoint: guide.meetingPoints[tourIndex],
    images,
    highlights: [
      focusPoints[0],
      focusPoints[1],
      isPrimaryTour ? "Slow morning pacing" : "Golden-hour finish",
    ],
    availableDates,
    status: "active",
  };
};

const buildTravelerEmail = (index) =>
  `traveler${String(index + 1).padStart(2, "0")}@travelmate.demo`;

const buildReviewComment = ({ guide, tourTitle, travelerName, rating }) => {
  const comments = [
    `The ${tourTitle} route felt polished, and ${guide.name} kept the pacing smooth from start to finish.`,
    `Everything was organized well, the communication was clear, and the day felt easy to trust.`,
    `The itinerary had a premium feel, with thoughtful stops and strong local context throughout.`,
    `It was a clean, professional experience that matched the city perfectly.`,
    `The route was comfortable, well timed, and very easy to recommend.`,
  ];

  const offset = guide.name.length + travelerName.length + rating;
  return comments[offset % comments.length];
};

const seedDemoData = async () => {
  await connectDB(process.env.MONGO_URI);

  try {
    await Promise.all([
      Booking.deleteMany({}),
      Review.deleteMany({}),
      Tour.deleteMany({}),
      GuideProfile.deleteMany({}),
      User.deleteMany({}),
      PasswordResetToken.deleteMany({}),
    ]);

    tourImageUrls = await buildTourImageUrls();

    const createdGuides = [];
    const bookingsByGuide = [];

    for (let guideIndex = 0; guideIndex < guideSeeds.length; guideIndex += 1) {
      const guideSeed = guideSeeds[guideIndex];

      const guideUser = await User.create({
        name: guideSeed.name,
        email: guideSeed.email,
        password: "GuidePass123!",
        role: "guide",
        gender: guideSeed.gender,
        avatar: buildAvatarDataUrl(guideSeed.name, guideIndex, guideSeed.gender),
      });

      const guideProfile = await GuideProfile.create({
        userId: guideUser._id,
        bio: guideSeed.bio,
        languages: guideSeed.languages,
        specialties: guideSeed.specialties,
        hourlyRate: guideSeed.hourlyRate,
        operatingCities: guideSeed.operatingCities,
        rating: 0,
        totalReviews: 0,
        yearsOfExperience: guideSeed.yearsOfExperience,
        isAvailable: true,
        verificationStatus: "verified",
      });

      const tours = await Tour.insertMany([
        buildTour(guideSeed, guideIndex, 0),
        buildTour(guideSeed, guideIndex, 1),
      ].map((tour) => ({
        ...tour,
        guideId: guideProfile._id,
      })));

      createdGuides.push({
        guideSeed,
        guideUser,
        guideProfile,
        tours,
      });
      bookingsByGuide.push([]);
    }

    const createdTravelers = [];

    for (let travelerIndex = 0; travelerIndex < travelerNames.length; travelerIndex += 1) {
      const travelerName = travelerNames[travelerIndex];
      const gender = travelerIndex % 2 === 0 ? "male" : "female";

      const traveler = await User.create({
        name: travelerName,
        email: buildTravelerEmail(travelerIndex),
        password: "TravelerPass123!",
        role: "traveler",
        gender,
        avatar: buildAvatarDataUrl(travelerName, travelerIndex + 20, gender),
      });

      createdTravelers.push(traveler);
    }

    const adminUser = await User.create({
      name: "TravelMate Admin",
      email: "admin@travelmate.demo",
      password: "AdminPass123!",
      role: "admin",
      gender: "male",
      avatar: buildAvatarDataUrl("TravelMate Admin", 99, "male"),
    });

    const bookingDocs = [];

    for (let guideIndex = 0; guideIndex < createdGuides.length; guideIndex += 1) {
      const guide = createdGuides[guideIndex];

      for (let travelerIndex = 0; travelerIndex < createdTravelers.length; travelerIndex += 1) {
        const traveler = createdTravelers[travelerIndex];
        const tourIndex = (guideIndex + travelerIndex) % 2;
        const tour = guide.tours[tourIndex];
        const bookingDate = pastDate(14 + ((guideIndex + travelerIndex) % 18));
        const numberOfTravelers = 1 + ((guideIndex + travelerIndex) % 4);
        const bookingId = new mongoose.Types.ObjectId();

        bookingDocs.push({
          _id: bookingId,
          travelerId: traveler._id,
          tourId: tour._id,
          guideId: guide.guideProfile._id,
          bookingDate,
          numberOfTravelers,
          totalPrice: numberOfTravelers * tour.pricePerPerson,
          specialRequests:
            specialRequests[(guideIndex + travelerIndex) % specialRequests.length],
          status: "completed",
          paymentStatus: "paid",
          confirmedAt: new Date(bookingDate.getTime() - 1000 * 60 * 60 * 24),
        });
        bookingsByGuide[guideIndex].push({
          bookingId,
          traveler,
          tour,
        });
      }
    }

    await Booking.insertMany(bookingDocs);

    const reviewDocs = [];
    for (let guideIndex = 0; guideIndex < createdGuides.length; guideIndex += 1) {
      const guide = createdGuides[guideIndex];
      const reviewTarget = 25 + ((guideIndex * 5) % 6);
      const guideBookings = bookingsByGuide[guideIndex].slice(0, reviewTarget);

      guideBookings.forEach((entry, reviewIndex) => {
        reviewDocs.push({
          bookingId: entry.bookingId,
          travelerId: entry.traveler._id,
          guideId: guide.guideProfile._id,
          rating: [5, 4, 5, 4, 5, 3][(guideIndex + reviewIndex) % 6],
          comment: buildReviewComment({
            guide: guide.guideSeed,
            tourTitle: entry.tour.title,
            travelerName: entry.traveler.name,
            rating: [5, 4, 5, 4, 5, 3][(guideIndex + reviewIndex) % 6],
          }),
        });
      });
    }

    await Review.insertMany(reviewDocs);

    for (const guide of createdGuides) {
      await syncGuideRating(guide.guideProfile._id);
    }

    const [userCount, guideCount, tourCount, bookingCount, reviewCount] = await Promise.all([
      User.countDocuments(),
      GuideProfile.countDocuments(),
      Tour.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments(),
    ]);

    console.log(
      `Demo dataset ready. Users: ${userCount}, Guides: ${guideCount}, Tours: ${tourCount}, Bookings: ${bookingCount}, Reviews: ${reviewCount}`,
    );
    console.log("Admin login: admin@travelmate.demo / AdminPass123!");
    console.log("Guide login: ayu.putri@travelmate.demo / GuidePass123!");
    console.log("Traveler login: traveler01@travelmate.demo / TravelerPass123!");
  } finally {
    await mongoose.disconnect();
  }
};

seedDemoData()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error("Demo seeding failed", error);
    await mongoose.disconnect();
    process.exit(1);
  });
