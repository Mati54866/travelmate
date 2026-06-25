import mongoose from "mongoose";

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  console.log("MongoDB connected");
};

export default connectDB;
