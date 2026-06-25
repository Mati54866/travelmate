const DEFAULT_AVATARS = {
  male: "/assets/avatar.avif",
  female: "/assets/femaleAvatar.avif",
};

export const getDefaultAvatar = (gender) =>
  gender === "female" ? DEFAULT_AVATARS.female : DEFAULT_AVATARS.male;

export const getAvatarSrc = (userLike) =>
  userLike?.avatar || getDefaultAvatar(userLike?.gender || "male");
