import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  Clock,
  MessageSquare,
  ArrowLeft,
  Eye,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusPill from "../../components/common/StatusPill";
import { bookingsApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate, formatDateTime } from "../../utils/format";
import {
  readResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

const BookingConfirmationPage = () => {
  const { id } = useParams();
  const cachedBooking = readResourceCache(`booking:${id}`);
  const [booking, setBooking] = useState(cachedBooking ?? null);
  const [loading, setLoading] = useState(!cachedBooking);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadBooking = async () => {
      try {
        if (!cachedBooking) {
          setLoading(true);
        }
        const { data } = await bookingsApi.getOne(id);
        if (!ignore) {
          setBooking(data.booking);
          writeResourceCache(`booking:${id}`, data.booking);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load booking confirmation.",
            ),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading booking details..." />;
  }

  if (error || !booking) {
    return (
      <EmptyState
        title="Booking unavailable"
        description={error || "This booking could not be found."}
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
      {/* Header Section */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75d780]/10">
                <CheckCircle className="h-4 w-4 text-[#75d780]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75d780]">
                Booking Confirmed
              </p>
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
              {booking.tourId?.title}
            </h1>
            <p className="mt-3 text-white/60">
              Scheduled for {formatDate(booking.bookingDate)} with{" "}
              <span className="text-white font-medium">
                {booking.guideId?.userId?.name}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill value={booking.status} />
            <StatusPill value={booking.paymentStatus} />
          </div>
        </div>
      </div>

      {/* Booking Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Travelers Card */}
        <div className="rounded-xl border border-white/10 bg-dark-3/50 p-5 transition-all duration-300 hover:border-[#75d780]/30 hover:shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-white/40" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Travelers
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-white">
            {booking.numberOfTravelers}
          </p>
        </div>

        {/* Total Price Card */}
        <div className="rounded-xl border border-white/10 bg-dark-3/50 p-5 transition-all duration-300 hover:border-[#75d780]/30 hover:shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-white/40" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Total Price
            </p>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#75d780]">
            {formatCurrency(booking.totalPrice)}
          </p>
        </div>

        {/* Meeting Point Card */}
        <div className="rounded-xl border border-white/10 bg-dark-3/50 p-5 transition-all duration-300 hover:border-[#75d780]/30 hover:shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-white/40" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Meeting Point
            </p>
          </div>
          <p className="mt-2 text-base font-medium text-white">
            {booking.tourId?.meetingPoint || "To be confirmed"}
          </p>
        </div>

        {/* Created Date Card */}
        <div className="rounded-xl border border-white/10 bg-dark-3/50 p-5 transition-all duration-300 hover:border-[#75d780]/30 hover:shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-white/40" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Booking Created
            </p>
          </div>
          <p className="mt-2 text-base font-medium text-white">
            {formatDateTime(booking.createdAt)}
          </p>
        </div>
      </div>

      {/* Special Requests Section */}
      {booking.specialRequests && (
        <div className="rounded-xl border border-white/10 bg-dark-3/50 p-6 transition-all duration-300 hover:border-[#75d780]/30">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-white/40" />
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">
              Special Requests
            </p>
          </div>
          <p className="mt-1 text-white/70 leading-relaxed">
            {booking.specialRequests}
          </p>
        </div>
      )}

      {/* Tour Date Info */}
      <div className="rounded-xl border border-white/10 bg-[#75d780]/5 p-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-[#75d780]" />
          <div>
            <p className="text-sm font-semibold text-white">Tour Date</p>
            <p className="text-sm text-white/60">
              {formatDate(booking.bookingDate)} • Please arrive 15 minutes early
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <Link
          to={`/tours/${booking.tourId?._id}`}
          className="inline-flex items-center gap-2 rounded-lg bg-[#75d780] px-6 py-2.5 text-sm font-bold text-[#071120] transition hover:bg-[#8ae994] hover:shadow-lg hover:shadow-[#75d780]/25"
        >
          <Eye className="h-4 w-4" />
          View Tour Details
        </Link>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
