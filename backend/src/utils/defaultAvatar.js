export const DEFAULT_AVATARS = {
  male: "/assets/avatar.avif",
  female: "/assets/femaleAvatar.avif",
};

export const getDefaultAvatarForGender = (gender = "male") =>
  gender === "female" ? DEFAULT_AVATARS.female : DEFAULT_AVATARS.male;

export const isDefaultAvatar = (avatar = "") =>
  Object.values(DEFAULT_AVATARS).includes(avatar);
