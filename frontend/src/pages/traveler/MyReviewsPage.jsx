import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  BookOpen,
  CalendarDays,
  MessageSquare,
  Pencil,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StarRating from "../../components/common/StarRating";
import { reviewsApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatDate } from "../../utils/format";
import {
  readResourceCache,
  updateResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";
import UserAvatar from "../../components/common/UserAvatar";

const shellCard =
  "rounded-[22px] bg-[#0b1528] shadow-[0_10px_30px_rgba(0,0,0,0.22)]";

const statTones = {
  green: "bg-[#13251f] text-[#7ee58f]",
  yellow: "bg-[#2b2414] text-[#ffd46b]",
  blue: "bg-[#111f36] text-[#7fb0ff]",
  purple: "bg-[#21162f] text-[#cb9cff]",
};

const statIcons = {
  green: MessageSquare,
  yellow: Star,
  blue: BookOpen,
  purple: CalendarDays,
};

const filterOptions = [
  { id: "all", label: "All Reviews" },
  { id: "highest", label: "Highest Rated" },
  { id: "lowest", label: "Lowest Rated" },
  { id: "recent", label: "Recent First" },
];

const StatCard = ({ label, value, hint, tone }) => {
  const Icon = statIcons[tone];

  return (
    <div className="rounded-2xl bg-[#0d182d] px-4 py-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${statTones[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-white">{value}</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
            {label}
          </p>
        </div>
      </div>
      <p className="mt-3 text-xs text-white/38">{hint}</p>
    </div>
  );
};

const MyReviewsPage = () => {
  const cachedReviews = readResourceCache("travelerReviews");
  const [reviews, setReviews] = useState(cachedReviews ?? []);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(!cachedReviews);
  const [activeFilter, setActiveFilter] = useState("all");

  const loadReviews = async () => {
    try {
      if (!cachedReviews) {
        setLoading(true);
      }
      const { data } = await reviewsApi.getMine();
      const nextReviews = data.reviews || [];
      setReviews(nextReviews);
      writeResourceCache("travelerReviews", nextReviews);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load reviews."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleDelete = async (id) => {
    try {
      await reviewsApi.remove(id);
      toast.success("Review deleted");
      const nextReviews = updateResourceCache("travelerReviews", (prev = []) =>
        prev.filter((review) => review._id !== id),
      );
      setReviews(nextReviews);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete review."));
    }
  };

  const handleSave = async (id) => {
    try {
      const { data } = await reviewsApi.update(id, draft);
      const nextReviews = updateResourceCache("travelerReviews", (prev = []) =>
        prev.map((review) => (review._id === id ? data.review : review)),
      );
      setReviews(nextReviews);
      setEditingId("");
      toast.success("Review updated");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update review."));
    }
  };

  const averageRating = reviews.length
    ? (
        reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  const completedTrips = new Set(
    reviews
      .map((review) => review.bookingId?._id || review.bookingId)
      .filter(Boolean),
  ).size;

  const filteredReviews = useMemo(() => {
    const next = [...reviews];

    if (activeFilter === "highest") {
      return next.sort((a, b) => b.rating - a.rating);
    }

    if (activeFilter === "lowest") {
      return next.sort((a, b) => a.rating - b.rating);
    }

    if (activeFilter === "recent") {
      return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [activeFilter, reviews]);

  if (loading) {
    return <LoadingSpinner label="Loading your reviews..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-white/42">
          Manage your traveler reviews dashboard
        </p>
        <h1 className="mt-1 text-3xl font-semibold text-white">My reviews</h1>
        <p className="mt-2 text-sm text-white/42">
          Edit or remove feedback you have left after completed tours.
        </p>
      </div>

      <div className={`${shellCard} p-4 sm:p-6`}>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Reviews"
            value={reviews.length}
            hint="Reviews currently visible"
            tone="green"
          />
          <StatCard
            label="Average Rating"
            value={averageRating}
            hint="Across all your submitted reviews"
            tone="yellow"
          />
          <StatCard
            label="Guides Reviewed"
            value={new Set(reviews.map((review) => review.guideId?._id)).size}
            hint="Distinct guides you reviewed"
            tone="blue"
          />
          <StatCard
            label="Tours Completed"
            value={completedTrips}
            hint="Finished tours with review history"
            tone="purple"
          />
        </div>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                  activeFilter === filter.id
                    ? "bg-[#75d780] text-[#071120]"
                    : "bg-white/[0.04] text-white/50 hover:text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <span className="rounded-full bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
            Newest first
          </span>
        </div>
      </div>

      <div className={`${shellCard} p-4 sm:p-6`}>
        {filteredReviews.length ? (
           <div className="grid gap-4 xl:grid-cols-2">
            {filteredReviews.map((review) => {
              const isEditing = editingId === review._id;

              return (
                <article
                  key={review._id}
                  className="rounded-[20px] bg-[#0d182d] p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <UserAvatar
                        user={review.guideId?.userId}
                        alt={review.guideId?.userId?.name || "Guide"}
                        imageClassName="h-12 w-12 rounded-full object-cover"
                        fallbackClassName="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-sm font-semibold text-white/60"
                      />
                      <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold text-white">
                          {review.guideId?.userId?.name || "Guide review"}
                        </h2>
                        <p className="mt-1 text-xs text-white/38">
                          {review.guideId?.operatingCities?.join(", ") ||
                            "Local guide"}
                        </p>
                        <p className="mt-1 text-xs text-white/28">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {isEditing ? (
                        <StarRating
                          value={draft.rating}
                          interactive
                          onChange={(rating) =>
                            setDraft((prev) => ({ ...prev, rating }))
                          }
                        />
                      ) : (
                        <StarRating value={review.rating} />
                      )}
                      <p className="mt-1 text-[11px] text-[#75d780]">
                        {review.rating >= 4 ? "Highly Rated" : "Verified Review"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#0a1425] px-4 py-3">
                    {isEditing ? (
                      <textarea
                        className="min-h-24 w-full bg-transparent text-sm text-white placeholder:text-white/25 focus:outline-none"
                        value={draft.comment}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            comment: event.target.value,
                          }))
                        }
                        placeholder="Write your updated review."
                      />
                    ) : (
                      <p className="text-sm leading-6 text-white/68">
                        {review.comment}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-[#75d780]">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Helpful review</span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSave(review._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#75d780] px-3 py-2 text-xs font-semibold text-[#071120]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId("")}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(review._id);
                              setDraft({
                                rating: review.rating,
                                comment: review.comment,
                              });
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/60 hover:text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(review._id)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="No reviews yet"
            description="Completed bookings unlock review writing and editing here."
          />
        )}
      </div>

      <div
        className={`${shellCard} flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between`}
      >
        <div>
          <p className="text-sm font-semibold text-white">
            Enjoying your trips?
          </p>
          <p className="mt-1 text-sm text-white/42">
            Keep browsing new local routes and leave great guides a review.
          </p>
        </div>
        <Link to="/guides" className="btn-primary text-xs px-5 py-2">
          Explore More Tours
        </Link>
      </div>
    </div>
  );
};

export default MyReviewsPage;
