import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Calendar,
  Users,
  DollarSign,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusPill from "../../components/common/StatusPill";
import { bookingsApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  readResourceCache,
  updateResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

const ManageBookingsPage = () => {
  const cachedBookings = readResourceCache("guideBookings");
  const [bookings, setBookings] = useState(cachedBookings ?? []);
  const [loading, setLoading] = useState(!cachedBookings);
  const [refreshing, setRefreshing] = useState(false);
  // actionLoading tracks which booking+action is in progress: "<bookingId>:<actionType>"
  const [actionLoading, setActionLoading] = useState(null);

  const loadBookings = async () => {
    try {
      if (!cachedBookings) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const { data } = await bookingsApi.getGuideBookings();
      const nextBookings = data.bookings || [];
      setBookings(nextBookings);
      writeResourceCache("guideBookings", nextBookings);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load guide bookings."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleAction = async (type, bookingId) => {
    setActionLoading(`${bookingId}:${type}`);
    try {
      const actionMap = {
        confirm: () => bookingsApi.confirm(bookingId),
        cancel: () => bookingsApi.cancel(bookingId),
        complete: () => bookingsApi.complete(bookingId),
      };

      const { data } = await actionMap[type]();
      const nextBookings = updateResourceCache("guideBookings", (prev = []) =>
        prev.map((booking) =>
          booking._id === bookingId ? data.booking : booking,
        ),
      );
      setBookings(nextBookings);
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update booking."));
    } finally {
      setActionLoading(null);
    }
  };

  const getActionButtons = (booking) => {
    const buttons = [];

    if (booking.status === "pending") {
      buttons.push({
        type: "confirm",
        label: "Confirm Booking",
        icon: <CheckCircle className="h-4 w-4" />,
        className: "bg-[#75d780] text-[#071120] hover:bg-[#8ae994]",
      });
    }

    if (booking.status === "confirmed") {
      buttons.push({
        type: "complete",
        label: "Mark Completed",
        icon: <CheckCircle className="h-4 w-4" />,
        className:
          "bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 hover:text-blue-300",
      });
    }

    if (booking.status !== "cancelled" && booking.status !== "completed") {
      buttons.push({
        type: "cancel",
        label: "Cancel Booking",
        icon: <XCircle className="h-4 w-4" />,
        className:
          "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 hover:text-red-300",
      });
    }

    return buttons;
  };

  if (loading) {
    return <LoadingSpinner label="Loading guide bookings..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75d780]/10">
                <Calendar className="h-4 w-4 text-[#75d780]" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#75d780]">
                Booking Management
              </p>
            </div>
            <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
              Manage Bookings
            </h1>
            <p className="mt-2 text-white/50">
              Confirm, complete, or cancel upcoming traveler requests.
              {refreshing && (
                <span className="text-[#75d780] ml-2">
                  Syncing latest data...
                </span>
              )}
            </p>
          </div>
          <button
            onClick={loadBookings}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="grid gap-5">
        {bookings.length ? (
          bookings.map((booking) => (
            <article
              key={booking._id}
              className="group rounded-xl border border-white/10 bg-dark-3/30 p-4 sm:p-6 transition-all duration-300 hover:border-[#75d780]/30 hover:bg-dark-3/50 hover:shadow-xl"
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="font-display text-xl font-bold text-white md:text-2xl group-hover:text-[#75d780] transition-colors">
                      {booking.tourId?.title || "Untitled Tour"}
                    </h2>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.travelerId?.name || "Unknown Traveler"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(booking.bookingDate)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {booking.numberOfTravelers} traveler
                      {booking.numberOfTravelers !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill value={booking.status} />
                  <StatusPill value={booking.paymentStatus} />
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-6 grid gap-4 lg:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-dark-4/30 p-3">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/40">
                    <Mail className="h-3 w-3" />
                    Traveler Contact
                  </p>
                  <p className="mt-1 text-sm font-medium text-white truncate">
                    {booking.travelerId?.email || "No email provided"}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-dark-4/30 p-3">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/40">
                    <DollarSign className="h-3 w-3" />
                    Total Amount
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#75d780]">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-dark-4/30 p-3">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-[0.2em] text-white/40">
                    <MessageSquare className="h-3 w-3" />
                    Special Requests
                  </p>
                  <p className="mt-1 text-sm text-white/60 truncate">
                    {booking.specialRequests || "No requests"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3 pt-3 border-t border-white/10">
                {getActionButtons(booking).map((btn) => {
                  const loadingKey = `${booking._id}:${btn.type}`;
                  const isLoading = actionLoading === loadingKey;
                  return (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => handleAction(btn.type, booking._id)}
                      disabled={isLoading}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${btn.className}`}
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        btn.icon
                      )}
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-white/10 bg-dark-3/30 p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Calendar className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-lg font-medium text-white/40">
              No guide bookings yet
            </p>
            <p className="mt-1 text-sm text-white/30">
              Traveler requests will land here as soon as they book.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookingsPage;
