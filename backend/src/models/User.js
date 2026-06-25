import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["traveler", "guide", "admin"],
      default: "traveler",
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      default: "male",
    },
    avatar: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  return next();
});

userSchema.methods.comparePassword = async function comparePassword(candidate) {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
