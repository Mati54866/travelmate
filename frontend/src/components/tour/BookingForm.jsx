import { useState } from "react";
import {
  Calendar,
  Users,
  MessageSquare,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "../../utils/format";

const BookingForm = ({
  tour,
  onSubmit,
  loading,
  isAuthenticated = false,
  alreadyBooked = false,
  onRefreshAvailability,
}) => {
  const [bookingDate, setBookingDate] = useState(null);
  const [numberOfTravelers, setNumberOfTravelers] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  const total = numberOfTravelers * (tour?.pricePerPerson || 0);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      bookingDate,
      numberOfTravelers: Number(numberOfTravelers),
      specialRequests,
    });
  };

  const buttonDisabled = loading || !bookingDate || alreadyBooked;

  // Format date for display
  const formatDateForDisplay = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-6 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] transition-shadow duration-300"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#75d780]/10">
          <Calendar className="h-5 w-5 text-[#75d780]" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-white md:text-2xl">
            Book This Tour
          </h3>
          <p className="text-xs text-white/40">
            Secure your spot with instant confirmation
          </p>
        </div>
      </div>

      {/* Date Picker - Custom styled */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <Calendar className="h-3.5 w-3.5" />
          Select Date
        </label>
        <div className="relative">
          {tour?.availableDates && tour.availableDates.length > 0 ? (
            <select
              value={bookingDate ? bookingDate.toISOString() : ""}
              onChange={(e) =>
                setBookingDate(e.target.value ? new Date(e.target.value) : null)
              }
              className="w-full rounded-xl border border-white/10 bg-[#0b1627] px-4 py-3 text-sm text-white outline-none transition focus:border-[#75d780] focus:ring-1 focus:ring-[#75d780]/50 [color-scheme:dark]"
              required
            >
              <option value="">Select a date</option>
              {tour.availableDates.map((d) => {
                const dateObj = new Date(d);
                if (Number.isNaN(dateObj.getTime())) return null;
                return (
                  <option key={d} value={dateObj.toISOString()}>
                    {formatDateForDisplay(dateObj)}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="w-full rounded-xl border border-white/10 bg-[#0b1627] px-4 py-3 text-sm text-white flex items-center justify-between">
              <span>No available dates published yet.</span>
              {onRefreshAvailability ? (
                <button
                  type="button"
                  onClick={onRefreshAvailability}
                  className="ml-4 rounded-md bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10"
                >
                  Refresh
                </button>
              ) : null}
            </div>
          )}
          <Calendar className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 pointer-events-none" />
        </div>
        {tour?.availableDates && tour.availableDates.length > 0 && (
          <p className="text-xs text-white/30">
            Choose from dates provided by guide
          </p>
        )}
      </div>

      {/* Travelers */}
      <div className="space-y-2 mt-4">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <Users className="h-3.5 w-3.5" />
          Number of Travelers
        </label>
        <input
          className="input-field"
          type="number"
          min="1"
          max={tour?.maxGroupSize || 20}
          value={numberOfTravelers}
          onChange={(event) => setNumberOfTravelers(Number(event.target.value))}
          placeholder="Number of travelers"
        />
        <p className="text-xs text-white/30">
          Max {tour?.maxGroupSize || 20} travelers per booking
        </p>
      </div>

      {/* Special Requests */}
      <div className="space-y-2 mt-4">
        <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/50">
          <MessageSquare className="h-3.5 w-3.5" />
          Special Requests (Optional)
        </label>
        <textarea
          className="input-field min-h-24 resize-none"
          value={specialRequests}
          onChange={(event) => setSpecialRequests(event.target.value)}
          placeholder="Dietary restrictions, accessibility needs, or special occasions..."
        />
      </div>

      {/* Price Breakdown */}
      <div className="rounded-xl bg-[#75d780]/5 border border-[#75d780]/10 p-4 mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/50">Price per person</span>
          <span className="text-sm font-medium text-white">
            {formatCurrency(tour?.pricePerPerson || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/50">Number of travelers</span>
          <span className="text-sm font-medium text-white">
            × {numberOfTravelers}
          </span>
        </div>
        <div className="pt-2 mt-2 border-t border-[#75d780]/10 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Total Amount</span>
          <span className="text-xl font-bold text-[#75d780]">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={buttonDisabled || !isAuthenticated}
          className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#071120] border-t-transparent" />
              Processing...
            </>
          ) : !isAuthenticated ? (
            <>
              <CreditCard className="h-4 w-4" />
              Login to Book
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Confirm Booking
            </>
          )}
        </button>
        {!isAuthenticated ? (
          <p className="mt-2 text-center text-xs text-white/45">
            Log in to confirm this booking.
          </p>
        ) : null}
        {alreadyBooked ? (
          <p className="mt-2 text-center text-xs text-white/45">
            You already have a booking for this tour.
          </p>
        ) : null}
      </div>

      {/* Selected Date Display */}
      {bookingDate && (
        <div className="mt-3 text-center">
          <p className="text-xs text-[#75d780]/70">
            Selected: {formatDateForDisplay(bookingDate)}
          </p>
        </div>
      )}

      {/* Guarantee Note */}
      <div className="flex items-center justify-center gap-2 pt-4 text-xs text-white/30">
        <CheckCircle className="h-3 w-3 text-[#75d780]" />
        <span>Free cancellation up to 24 hours before tour</span>
      </div>
    </form>
  );
};

export default BookingForm;
