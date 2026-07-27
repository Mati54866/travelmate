import dotenv from "dotenv";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB once (cached for serverless warm instances)
let isConnected = false;
const ensureDBConnected = async () => {
  if (!isConnected) {
    await connectDB(process.env.MONGO_URI);
    isConnected = true;
  }
};

// Vercel serverless: connect DB on each cold start, then export app
ensureDBConnected().catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
});

// Local development: start a real HTTP server
if (process.env.NODE_ENV !== "production") {
  ensureDBConnected()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`TravelMate API running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
}

// Vercel requires a default export of the Express app
export default app;

