import { useEffect, useMemo, useState } from "react";
import { getAvatarSrc } from "../../utils/avatar";

const buildInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

const UserAvatar = ({
  user,
  alt,
  imageClassName,
  fallbackClassName,
  title,
}) => {
  const src = useMemo(() => getAvatarSrc(user), [user?.avatar, user?.gender]);
  const [imageFailed, setImageFailed] = useState(false);
  const initials = useMemo(() => buildInitials(user?.name), [user?.name]);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  if (src && !imageFailed) {
    return (
      <img
        src={src}
        alt={alt || user?.name || "User"}
        title={title}
        className={imageClassName}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={fallbackClassName} title={title}>
      {initials}
    </div>
  );
};

export default UserAvatar;
