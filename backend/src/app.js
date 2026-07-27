import "express-async-errors";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";
import morgan from "morgan";
import xssClean from "xss-clean";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import guideRoutes from "./routes/guideRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import tourRoutes from "./routes/tourRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

const corsOptions = {
  origin(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Define allowed origins
    const allowedOrigins = [
      process.env.CLIENT_URL || "http://localhost:5173",
      "https://travelmate-guide.vercel.app",
      "https://travelmate-backend.vercel.app",
      "https://tour-guide-frontend-qa47dnqif-neon-guides.vercel.app",
      /\.vercel\.app$/, // Allow all Vercel preview URLs
      /localhost:\d+$/, // Allow local development
      /127\.0\.0\.1:\d+$/, // Allow local IP
    ];

    // Check if origin is allowed
    const isAllowed = allowedOrigins.some((allowed) => {
      if (typeof allowed === "string") return origin === allowed;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Apply CORS to all routes — must be before other middleware
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests with the same config
app.options("*", cors(corsOptions));

// Security Middleware
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());
app.use(morgan("dev"));


app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TravelMate API is running! 🚀',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      tours: '/api/tours',
      guides: '/api/guides',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      admin: '/api/admin',
      upload: '/api/upload'
    }
  });
});


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "TravelMate API is healthy" });
});


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/tours", tourRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/upload", uploadRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;