import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import PasswordResetToken from "../models/PasswordResetToken.js";
import User from "../models/User.js";
import { deleteFromImageKit } from "../utils/imagekitUpload.js";
import { getDefaultAvatarForGender, isDefaultAvatar } from "../utils/defaultAvatar.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google OAuth is not configured");
  }

  return new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  gender: user.gender,
  avatar: user.avatar,
  avatarPublicId: user.avatarPublicId,
  googleId: user.googleId,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const respondWithAuth = (res, user, statusCode = 200) => {
  const token = generateToken(user._id);
  return res.status(statusCode).json({
    message: "Authentication successful",
    token,
    user: sanitizeUser(user),
  });
};

export const register = async (req, res) => {
  const { name, email, password, role, gender } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json({ message: "Email already in use" });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "traveler",
    gender: gender || "male",
    avatar: getDefaultAvatarForGender(gender || "male"),
  });

  return respondWithAuth(res, user, 201);
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  return respondWithAuth(res, user);
};

export const googleLogin = async (req, res) => {
  const { credential, role, gender } = req.body;
  const ticket = await getGoogleClient().verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  const { email, name, sub, picture } = payload;

  let user = await User.findOne({
    $or: [{ email }, { googleId: sub }],
  });

  if (!user) {
    user = await User.create({
      name,
      email,
      googleId: sub,
      avatar: picture || getDefaultAvatarForGender(gender || "male"),
      gender: gender || "male",
      role: role || "traveler",
    });
  } else if (!user.googleId) {
    user.googleId = sub;
    if (!user.avatar && picture) {
      user.avatar = picture;
    }
    if (!user.gender && gender) {
      user.gender = gender;
    }
    await user.save();
  }

  return respondWithAuth(res, user);
};

export const getCurrentUser = async (req, res) => {
  return res.status(200).json({ user: sanitizeUser(req.user) });
};

export const updateProfile = async (req, res) => {
  const fields = ["name", "avatar", "avatarPublicId", "gender"];
  const currentAvatarPublicId = req.user.avatarPublicId;
  const nextAvatarPublicId =
    typeof req.body.avatarPublicId !== "undefined"
      ? req.body.avatarPublicId
      : currentAvatarPublicId;
  const shouldDeleteCurrentAvatar =
    currentAvatarPublicId &&
    currentAvatarPublicId !== nextAvatarPublicId &&
    currentAvatarPublicId !== req.body.avatar;

  fields.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      req.user[field] = req.body[field];
    }
  });

  if (
    typeof req.body.gender !== "undefined" &&
    (!req.user.avatar || isDefaultAvatar(req.user.avatar))
  ) {
    req.user.avatar = getDefaultAvatarForGender(req.body.gender);
  }

  if (shouldDeleteCurrentAvatar) {
    try {
      await deleteFromImageKit(currentAvatarPublicId);
    } catch {
      // Ignore cleanup failures so profile updates still succeed.
    }
  }

  await req.user.save();

  return res.status(200).json({
    message: "Profile updated",
    user: sanitizeUser(req.user),
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!user.password) {
    return res.status(400).json({
      message: "Password change is unavailable for Google-only accounts",
    });
  }

  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    return res.status(400).json({ message: "Current password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json({ message: "Password updated successfully" });
};

export const forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res
      .status(200)
      .json({ message: "If this email exists, a reset link has been sent" });
  }

  await PasswordResetToken.deleteMany({ userId: user._id });
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await PasswordResetToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 30),
  });

  const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: user.email,
    subject: "TravelMate password reset",
    html: `
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password. This link expires in 30 minutes.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
    `,
  });

  return res.status(200).json({
    message: "If this email exists, a reset link has been sent",
    ...(process.env.NODE_ENV !== "production" && {
      resetTokenPreview: rawToken,
    }),
  });
};

export const resetPassword = async (req, res) => {
  const tokenHash = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");
  const resetDoc = await PasswordResetToken.findOne({
    tokenHash,
    expiresAt: { $gt: new Date() },
  });

  if (!resetDoc) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  const user = await User.findById(resetDoc.userId).select("+password");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.password = req.body.password;
  await user.save();
  await PasswordResetToken.deleteMany({ userId: user._id });

  return res.status(200).json({ message: "Password reset successful" });
};
