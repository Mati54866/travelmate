import { useEffect, useMemo, useState } from "react";
import { authApi, uploadApi } from "../../api/services";
import UserAvatar from "../../components/common/UserAvatar";
import useAuth from "../../hooks/useAuth";
import avatarGallery from "../../data/avatarGallery.json";
import { getErrorMessage } from "../../utils/api";
import { getDefaultAvatar } from "../../utils/avatar";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const defaultAvatar = getDefaultAvatar(user?.gender || "male");

  const avatarChoices = useMemo(() => {
    const preferred = avatarGallery.filter(
      (item) => item.gender === user?.gender,
    );
    const rest = avatarGallery.filter((item) => item.gender !== user?.gender);
    return [...preferred, ...rest];
  }, [user?.gender]);

  useEffect(() => {
    setSelectedAvatar(user?.avatar || defaultAvatar);
  }, [user?.avatar, defaultAvatar]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      setSelectedAvatar("");
    }
  };

  const handleAvatarSave = async () => {
    if (!avatarFile && !selectedAvatar) return;

    setProfileLoading(true);

    try {
      if (avatarFile) {
        const { data } = await uploadApi.uploadSingle(avatarFile);
        await updateProfile({
          avatar: data.image.url,
          avatarPublicId: data.image.publicId,
        });
        setSelectedAvatar(data.image.url);
      } else {
        await updateProfile({
          avatar: selectedAvatar,
          avatarPublicId: "",
        });
      }

      toast.success("Profile picture updated!");
      setAvatarFile(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update avatar"));
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update password"));
    } finally {
      setPasswordLoading(false);
    }
  };

  const activeAvatar = avatarPreviewUrl || selectedAvatar;
  const hasPendingAvatarChange =
    avatarFile || selectedAvatar !== (user?.avatar || defaultAvatar);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f1625] to-[#0a1020] p-5 sm:p-6 md:p-8">
        <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
          Profile Settings
        </h1>
        <p className="mt-2 text-white/50">
          Manage your account information and security
        </p>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-white md:text-2xl">
          Profile Information
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Update your profile photo and personal details
        </p>

        <div className="mt-6 grid gap-8 xl:grid-cols-[300px,1fr]">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <UserAvatar
                user={{ ...user, avatar: activeAvatar }}
                alt={user?.name}
                imageClassName="h-28 w-28 rounded-full object-cover border-2 border-[#75d780]/30 md:h-36 md:w-36"
                fallbackClassName="flex h-28 w-28 items-center justify-center rounded-full bg-white/5 border-2 border-[#75d780]/30 text-2xl font-semibold text-white/60 md:h-36 md:w-36"
              />
              <div className="absolute bottom-0 right-0 rounded-full bg-[#75d780] p-1.5">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <svg
                    className="h-3 w-3 text-[#071120]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </label>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-white">
                {user?.name || "Your profile"}
              </p>
              <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                {user?.role === "guide"
                  ? "Guide Account"
                  : user?.role === "admin"
                    ? "Admin Account"
                    : "Traveler Account"}
              </p>
            </div>

            {hasPendingAvatarChange && (
              <button
                onClick={handleAvatarSave}
                disabled={profileLoading}
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
              >
                {profileLoading ? "Saving..." : "Save Avatar"}
              </button>
            )}

            <p className="max-w-xs text-center text-xs leading-5 text-white/40">
              Choose a preset portrait or upload your own. Uploaded avatars are
              stored in ImageKit and saved to your profile.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-white/50">Full Name</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  {user?.name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">
                  Email Address
                </p>
                <p className="mt-1 break-words text-lg font-semibold text-white">
                  {user?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">
                  Account Type
                </p>
                <p className="mt-1">
                  <span className="inline-flex rounded-full border border-[#75d780]/20 bg-[#75d780]/10 px-3 py-1 text-sm font-semibold text-[#75d780]">
                    {user?.role === "guide" ? "Professional Guide" : "Traveler"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-white/50">
                  Member Since
                </p>
                <p className="mt-1 text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Just joined"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white/50">
                    Avatar Library
                  </p>
                  <p className="mt-1 text-sm text-white/40">
                    Pick a portrait that fits your profile.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null);
                    setSelectedAvatar(defaultAvatar);
                  }}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:text-white"
                >
                  Reset default
                </button>
              </div>

              <div className="mt-4 grid max-h-[420px] grid-cols-3 gap-3 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-5">
                {avatarChoices.map((avatar) => {
                  const isSelected =
                    !avatarFile && selectedAvatar === avatar.src;

                  return (
                    <button
                      key={avatar.src}
                      type="button"
                      onClick={() => {
                        setAvatarFile(null);
                        setSelectedAvatar(avatar.src);
                      }}
                      className={`overflow-hidden rounded-2xl border bg-white/5 p-1 text-left transition ${
                        isSelected
                          ? "border-[#75d780] ring-2 ring-[#75d780]/30"
                          : "border-white/10 hover:border-white/25"
                      }`}
                    >
                      <img
                        src={avatar.src}
                        alt={avatar.label}
                        className="h-24 w-full rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="px-1 py-2">
                        <p className="truncate text-[11px] font-semibold text-white">
                          {avatar.label}
                        </p>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-white/35">
                          {avatar.gender}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 md:p-8">
        <h2 className="text-xl font-bold text-white md:text-2xl">
          Change Password
        </h2>
        <p className="mt-1 text-sm text-white/50">
          Update your password to keep your account secure
        </p>

        <form onSubmit={handlePasswordUpdate} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              Current Password
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              className="input-field"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-white/60">
              New Password
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              className="input-field"
              placeholder="Enter new password (min 6 characters)"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="btn-primary w-full md:w-auto"
          >
            {passwordLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
