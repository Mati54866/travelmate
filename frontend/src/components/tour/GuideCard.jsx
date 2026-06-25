import { Link } from "react-router-dom";
import { MapPin, Users, Wallet } from "lucide-react";
import StarRating from "../common/StarRating";
import UserAvatar from "../common/UserAvatar";
import { formatCurrency } from "../../utils/format";

const GuideCard = ({ guide }) => (
  <article className="rounded-[20px] bg-[#0b1528] p-5 shadow-[0_10px_28px_rgba(0,0,0,0.22)] transition hover:-translate-y-1">
    <div className="flex items-start gap-4">
      <UserAvatar
        user={guide.userId}
        alt={guide.userId?.name}
        imageClassName="h-16 w-16 rounded-2xl object-cover"
        fallbackClassName="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-lg font-semibold text-white/60"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-semibold text-white">
              {guide.userId?.name}
            </h3>
            <p className="mt-1 truncate text-xs text-white/38">
              {guide.operatingCities.join(", ")}
            </p>
          </div>
          <span className="rounded-full bg-[#75d780]/12 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8ceb97]">
            {guide.verificationStatus}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StarRating value={guide.rating} />
          <span className="text-xs text-white/38">
            {guide.rating.toFixed(1)} ({guide.totalReviews} reviews)
          </span>
        </div>
      </div>
    </div>

    <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/55">
      {guide.bio}
    </p>

    <div className="mt-4 flex flex-wrap gap-2">
      {guide.specialties.slice(0, 3).map((item) => (
        <span
          key={item}
          className="rounded-full bg-white/[0.05] px-3 py-1 text-[11px] font-semibold text-white/68"
        >
          {item}
        </span>
      ))}
    </div>

    <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-white/[0.03] p-3 text-center">
      <div>
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#13251f] text-[#7ee58f]">
          <Wallet className="h-4 w-4" />
        </div>
        <p className="mt-2 text-sm font-semibold text-white">
          {formatCurrency(guide.hourlyRate)}
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
          Hourly
        </p>
      </div>
      <div>
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#111f36] text-[#7fb0ff]">
          <Users className="h-4 w-4" />
        </div>
        <p className="mt-2 text-sm font-semibold text-white">
          {guide.totalReviews}
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
          Reviews
        </p>
      </div>
      <div>
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-[#21162f] text-[#cb9cff]">
          <MapPin className="h-4 w-4" />
        </div>
        <p className="mt-2 text-sm font-semibold text-white">
          {guide.operatingCities.length}
        </p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/30">
          Cities
        </p>
      </div>
    </div>

    <div className="mt-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-white/30">
          Experience
        </p>
        <p className="mt-1 text-sm font-medium text-white">
          {guide.yearsOfExperience || 0} years
        </p>
      </div>
      <Link
        to={`/guides/${guide._id}`}
        className="rounded-xl bg-[#75d780] px-4 py-2 text-sm font-semibold text-[#071120] transition hover:bg-[#89e894]"
      >
        View Profile
      </Link>
    </div>
  </article>
);

export default GuideCard;
