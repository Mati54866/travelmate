import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowRight,
  Eye,
  ArrowLeft,
  Globe,
} from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import ImageGallery from "../components/common/ImageGallery";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StatusPill from "../components/common/StatusPill";
import BookingForm from "../components/tour/BookingForm";
import { bookingsApi, toursApi } from "../api/services";
import useAuth from "../hooks/useAuth";
import { getErrorMessage } from "../utils/api";
import { formatCurrency, formatDate } from "../utils/format";
import {
  readResourceCache,
  updateResourceCache,
  writeResourceCache,
} from "../utils/resourceCache";

const TourDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cachedTour = readResourceCache(`tour:${id}`);
  const [tour, setTour] = useState(cachedTour ?? null);
  const [loading, setLoading] = useState(!cachedTour);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [alreadyBooked, setAlreadyBooked] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadTour = async () => {
      try {
        if (!cachedTour) {
          setLoading(true);
        }
        const { data } = await toursApi.getOne(id);
        if (!ignore) {
          setTour(data.tour);
          writeResourceCache(`tour:${id}`, data.tour);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(requestError, "Unable to load tour details."),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadTour();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Check if current traveler already has a booking for this tour
  useEffect(() => {
    let ignore = false;
    const checkBooking = async () => {
      if (!user) return;
      try {
        const { data } = await bookingsApi.getMine();
        if (ignore) return;
        const found = (data.bookings || []).some((b) => {
          const tourId =
            b.tourId?._id ||
            (b.tourId && b.tourId.toString && b.tourId.toString());
          return tourId === id && b.status !== "cancelled";
        });
        setAlreadyBooked(found);
      } catch (e) {
        // ignore
      }
    };

    checkBooking();

    return () => {
      ignore = true;
    };
  }, [user, id]);

  const handleBooking = async (payload) => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/tours/${id}` } } });
      return;
    }

    try {
      setBookingLoading(true);
      const { data } = await bookingsApi.create({
        ...payload,
        tourId: id,
      });
      updateResourceCache("travelerBookings", (prev = []) => [
        data.booking,
        ...prev,
      ]);
      writeResourceCache(`booking:${data.booking._id}`, data.booking);
      toast.success("Booking created");
      navigate(`/booking-confirmation/${data.booking._id}`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to create booking."));
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading tour details..." />;
  }

  if (error || !tour) {
    return (
      <EmptyState
        title="Tour unavailable"
        description={error || "This tour could not be found."}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="space-y-6">
        {/* Tour Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <StatusPill value={tour.status} />
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 shadow-md">
            <Users className="h-3.5 w-3.5 text-white/40" />
            <span className="text-sm font-medium text-white/70">
              Max {tour.maxGroupSize} guests
            </span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 shadow-md">
            <Clock className="h-3.5 w-3.5 text-white/40" />
            <span className="text-sm font-medium text-white/70">
              {tour.duration} hours
            </span>
          </div>
          {tour.location && (
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10 shadow-md">
              <MapPin className="h-3.5 w-3.5 text-white/40" />
              <span className="text-sm font-medium text-white/70">
                {tour.location}
              </span>
            </div>
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
          {/* Left Column - Tour Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                {tour.title}
              </h1>
              <p className="mt-4 text-lg text-white/60 leading-relaxed">
                {tour.description}
              </p>
            </div>
            <ImageGallery images={tour.images} />
          </div>

          {/* Right Column - 3-Card Stack */}
          <div className="space-y-6">
            {/* Card 1: Host Info */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Hosted by
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
                {tour.guideId?.userId?.name}
              </h2>
              {tour.meetingPoint && (
                <div className="mt-3 flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-white/40 flex-shrink-0" />
                  <p className="text-sm text-white/60">{tour.meetingPoint}</p>
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#75d780]">
                    {formatCurrency(tour.pricePerPerson)}
                  </span>
                  <span className="text-sm text-white/50">per traveler</span>
                </div>
              </div>
              {tour.guideId?._id ? (
                <Link
                  to={`/guides/${tour.guideId._id}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#75d780] hover:text-[#8ae994] transition-colors"
                >
                  View guide profile
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            {/* Card 2: Tour Snapshot - Key Info at a Glance */}
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75d780]/10">
                  <Sparkles className="h-4 w-4 text-[#75d780]" />
                </div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">
                  Tour Snapshot
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <Clock className="h-4 w-4" />
                    Duration
                  </span>
                  <span className="text-sm font-medium text-white">
                    {tour.duration} hours
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <Users className="h-4 w-4" />
                    Max Group Size
                  </span>
                  <span className="text-sm font-medium text-white">
                    {tour.maxGroupSize} travelers
                  </span>
                </div>
                {tour.languages && tour.languages.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm text-white/50">
                      <Globe className="h-4 w-4" />
                      Languages
                    </span>
                    <span className="text-sm font-medium text-white">
                      {tour.languages.join(", ")}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle className="h-4 w-4" />
                    Cancellation
                  </span>
                  <span className="text-sm font-medium text-[#75d780]">
                    Free up to 24h
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Booking Form OR Preview Mode */}
            {user?.role === "guide" ? (
              <div className="rounded-2xl border border-[#75d780]/20 bg-gradient-to-br from-[#75d780]/5 to-transparent p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#75d780]/10">
                    <Eye className="h-6 w-6 text-[#75d780]" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Preview Mode
                  </h3>
                  <p className="mt-2 text-sm text-white/50">
                    You're viewing this tour as a guide. Travelers can book this
                    experience here.
                  </p>
                  <Link
                    to="/guide/tours"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#75d780]/10 px-4 py-2 text-sm font-semibold text-[#75d780] transition hover:bg-[#75d780]/20 border border-[#75d780]/20"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to My Tours
                  </Link>
                </div>
              </div>
            ) : (
              <BookingForm
                tour={tour}
                onSubmit={handleBooking}
                loading={bookingLoading}
                isAuthenticated={Boolean(user)}
                alreadyBooked={alreadyBooked}
                onRefreshAvailability={async () => {
                  try {
                    setLoading(true);
                    const { data } = await toursApi.getOne(id);
                    setTour(data.tour);
                    writeResourceCache(`tour:${id}`, data.tour);
                    setLoading(false);
                  } catch (e) {
                    setLoading(false);
                  }
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Included & Excluded Section */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-[#75d780]" />
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Included
            </h2>
          </div>
          {tour.includedItems.length ? (
            <ul className="space-y-2">
              {tour.includedItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-white/70">
                  <span className="text-[#75d780] mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40">No included items listed yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-6 w-6 text-red-400" />
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Excluded
            </h2>
          </div>
          {tour.excludedItems.length ? (
            <ul className="space-y-2">
              {tour.excludedItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-white/70">
                  <span className="text-red-400 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/40">No exclusions listed.</p>
          )}
        </div>
      </section>

      {/* Highlights & Available Dates Section */}
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Highlights
            </h2>
          </div>
          {tour.highlights.length ? (
            <div className="flex flex-wrap gap-2">
              {tour.highlights.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[#75d780]/10 px-3 py-1.5 text-sm font-medium text-[#75d780] border border-[#75d780]/20 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/40">Highlights will be added soon.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-white/60" />
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
              Available Dates
            </h2>
          </div>
          {tour.availableDates.length ? (
            <div className="flex flex-wrap gap-2">
              {tour.availableDates.map((date) => (
                <span
                  key={date}
                  className="rounded-lg border border-white/10 bg-dark-3/50 px-3 py-1.5 text-sm font-medium text-white/70 shadow-sm"
                >
                  {formatDate(date)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white/40">
              No availability dates published yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TourDetailsPage;
