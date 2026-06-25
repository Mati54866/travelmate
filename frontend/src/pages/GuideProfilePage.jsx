// GuideProfilePage.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MapPin,
  Globe,
  Briefcase,
  Calendar,
  Users,
  Star as StarIcon,
} from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StarRating from "../components/common/StarRating";
import StatusPill from "../components/common/StatusPill";
import UserAvatar from "../components/common/UserAvatar";
import TourCard from "../components/tour/TourCard";
import { guidesApi } from "../api/services";
import { getErrorMessage } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/format";
import { readResourceCache, writeResourceCache } from "../utils/resourceCache";

const GuideProfilePage = () => {
  const { id } = useParams();
  const cachedGuide = readResourceCache(`guide:${id}`);
  const cachedTours = readResourceCache(`guide:${id}:tours`);
  const cachedReviews = readResourceCache(`guide:${id}:reviews`);
  const [guide, setGuide] = useState(cachedGuide ?? null);
  const [tours, setTours] = useState(cachedTours ?? []);
  const [reviews, setReviews] = useState(cachedReviews ?? []);
  const [loading, setLoading] = useState(
    !cachedGuide && !cachedTours && !cachedReviews,
  );
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadGuide = async () => {
      try {
        if (!cachedGuide && !cachedTours && !cachedReviews) {
          setLoading(true);
        }
        const [
          { data: guideData },
          { data: toursData },
          { data: reviewsData },
        ] = await Promise.all([
          guidesApi.getOne(id),
          guidesApi.getTours(id),
          guidesApi.getReviews(id),
        ]);

        if (!ignore) {
          setGuide(guideData.guide);
          setTours(toursData.tours || []);
          setReviews(reviewsData.reviews || []);
          writeResourceCache(`guide:${id}`, guideData.guide);
          writeResourceCache(`guide:${id}:tours`, toursData.tours || []);
          writeResourceCache(`guide:${id}:reviews`, reviewsData.reviews || []);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(requestError, "Unable to load guide profile."),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadGuide();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading guide profile..." />;
  }

  if (error || !guide) {
    return (
      <EmptyState
        title="Guide unavailable"
        description={error || "This guide profile could not be found."}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Main Profile Section */}
      <section className="rounded-2xl bg-[#0a1020] p-5 shadow-lg transition-all duration-300 sm:p-8">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[0.9fr,1.1fr] lg:items-center">
          <UserAvatar
            user={guide.userId}
            alt={guide.userId?.name}
            imageClassName="h-[200px] w-full rounded-2xl object-cover shadow-xl sm:h-[280px] lg:h-[360px]"
            fallbackClassName="flex h-[200px] w-full items-center justify-center rounded-2xl bg-white/5 text-6xl font-bold text-white/40 shadow-xl sm:h-[280px] lg:h-[360px]"
          />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill value={guide.verificationStatus} />
              <StatusPill value={guide.isAvailable ? "active" : "inactive"} />
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
              {guide.userId?.name}
            </h1>
            <p className="mt-4 text-lg text-white/60 leading-relaxed">
              {guide.bio}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <StarRating value={guide.rating} />
              <span className="text-sm text-white/50">
                {guide.rating.toFixed(1)} average from {guide.totalReviews}{" "}
                reviews
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                  <MapPin className="h-3 w-3" />
                  Cities
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {guide.operatingCities.join(", ")}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Hourly rate
                </p>
                <p className="mt-2 text-2xl font-bold text-[#75d780]">
                  {formatCurrency(guide.hourlyRate)}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                  <Globe className="h-3 w-3" />
                  Languages
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {guide.languages.join(", ")}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50 flex items-center gap-2">
                  <Briefcase className="h-3 w-3" />
                  Experience
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {guide.yearsOfExperience} years
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {guide.specialties.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#75d780]/10 px-3 py-1.5 text-sm font-medium text-[#75d780]"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tours Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Live Tours
            </h2>
            <p className="mt-2 text-white/50">
              Active itineraries that guide you around different cities.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          {tours.length ? (
            <>
              {/* Featured Tour - Fixed height card matching image design */}
              {tours[0] && (
                <Link
                  to={`/tours/${tours[0]._id}`}
                  className="group block overflow-hidden rounded-2xl bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="grid md:grid-cols-[minmax(0,320px),1fr]">
                    {/* Fixed height image container - consistent for all featured tours */}
                    <div className="relative h-64 md:h-72 w-full">
                      <img
                        src={tours[0].images?.[0] || "/assets/feturedTour.avif"}
                        alt={tours[0].title}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {tours[0].isSoldOut && (
                        <div className="absolute top-4 right-4">
                          <span className="text-xs px-3 py-1.5 rounded-full bg-black/60 text-white backdrop-blur-sm font-medium">
                            SOLD OUT
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 flex flex-col justify-between">
                      <div>
                        {/* Badge tags - dynamic from tour categories or default */}
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            City Tour
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                            {tours[0].duration} hrs
                          </span>
                          {tours[0].location && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                              {tours[0].location.split(",")[0]}
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white">
                          {tours[0].title}
                        </h3>

                        <p className="mt-3 text-white/50 text-sm line-clamp-2">
                          {tours[0].description}
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-white/40" />
                            <span className="text-sm text-white/60">
                              {tours[0].maxGroupSize || 6} people
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-white">
                              {formatCurrency(tours[0].pricePerPerson)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-white/10">
                        <button className="text-sm font-medium text-[#75d780] hover:text-[#8ceb97] flex items-center gap-1">
                          Explore Details <span aria-hidden="true">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Remaining tours - ALL cards have identical heights */}
              {tours.length > 1 && (
                <div className="grid gap-4">
                  {tours.slice(1).map((tour) => (
                    <Link
                      key={tour._id}
                      to={`/tours/${tour._id}`}
                      className="group block overflow-hidden rounded-2xl bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="flex flex-row">
                        {/* Fixed width AND fixed height image container - identical for every card */}
                        <div className="relative w-[140px] h-[140px] md:w-[160px] md:h-[160px] flex-shrink-0">
                          <img
                            src={tour.images?.[0] || "/assets/feturedTour.avif"}
                            alt={tour.title}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h3 className="font-semibold text-white text-base md:text-lg">
                                {tour.title}
                              </h3>
                              {tour.isSoldOut && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-black/60 text-white">
                                  SOLD OUT
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-white/40 text-sm line-clamp-2">
                              {tour.description}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50">
                              <span>{tour.duration} hrs</span>
                              <span>•</span>
                              <span className="truncate max-w-[150px]">
                                {tour.location || "Various locations"}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-[#75d780]">
                                {formatCurrency(tour.pricePerPerson)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <span className="text-xs text-[#75d780] group-hover:underline">
                              Explore Details →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl bg-white/5 p-12 text-center">
              <EmptyState
                title="No active tours yet"
                description="This guide has not published an active itinerary yet."
              />
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              Traveler Reviews
            </h2>
            <p className="mt-2 text-white/50">
              {reviews.length} verified review{reviews.length !== 1 ? "s" : ""}{" "}
              from completed bookings
            </p>
          </div>
          {reviews.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-[#75d780]/10 px-4 py-2">
              <StarIcon className="h-4 w-4 text-[#75d780]" />
              <span className="text-sm font-semibold text-white">
                {guide.rating.toFixed(1)} / 5.0
              </span>
            </div>
          )}
        </div>

        {reviews.length ? (
          <div className="grid gap-5">
            {reviews.map((review, index) => (
              <article
                key={review._id}
                className="group rounded-xl bg-white/5 p-6 transition-all duration-300 hover:bg-white/10"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <UserAvatar
                        user={review.travelerId}
                        alt={review.travelerId?.name || "Traveler"}
                        imageClassName="h-10 w-10 rounded-full object-cover"
                        fallbackClassName="flex h-10 w-10 items-center justify-center rounded-full bg-[#75d780]/10 text-sm font-bold text-[#75d780]"
                      />
                    <div>
                      <p className="font-semibold text-white">
                        {review.travelerId?.name || "Verified Traveler"}
                      </p>
                      <p className="text-xs text-white/40">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="mt-4 text-white/60 leading-relaxed sm:pl-14">
                  "{review.comment}"
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white/5 p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
              <StarIcon className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-lg font-medium text-white/40">No reviews yet</p>
            <p className="mt-1 text-sm text-white/30">
              Completed bookings will unlock verified traveler feedback here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default GuideProfilePage;
