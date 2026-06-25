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

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests from the configured client or from localhost/127.0.0.1 on any port (dev)
      if (!origin) return callback(null, true);
      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const isLocalhost =
        /^(https?:)?\/\/localhost(:\d+)?$/.test(origin) ||
        /^(https?:)?\/\/127\.0\.0\.1(:\d+)?$/.test(origin);
      if (origin === clientUrl || isLocalhost) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xssClean());
app.use(hpp());
app.use(morgan("dev"));

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
