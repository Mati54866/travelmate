import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatCard from "../../components/common/StatCard";
import StatusPill from "../../components/common/StatusPill";
import { bookingsApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import { readResourceCache, writeResourceCache } from "../../utils/resourceCache";

const EarningsPage = () => {
  const cachedBookings = readResourceCache("guideBookings");
  const [bookings, setBookings] = useState(cachedBookings ?? []);
  const [loading, setLoading] = useState(!cachedBookings);

  useEffect(() => {
    let ignore = false;

    const loadBookings = async () => {
      try {
        if (!cachedBookings) {
          setLoading(true);
        }
        const { data } = await bookingsApi.getGuideBookings();
        if (!ignore) {
          const nextBookings = data.bookings || [];
          setBookings(nextBookings);
          writeResourceCache("guideBookings", nextBookings);
        }
      } catch (error) {
        if (!ignore) {
          toast.error(getErrorMessage(error, "Unable to load earnings."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadBookings();

    return () => {
      ignore = true;
    };
  }, []);

  const paidBookings = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === "paid"),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );
  const totalPaid = paidBookings.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );
  const pendingPayout = bookings
    .filter(
      (booking) =>
        booking.status === "confirmed" && booking.paymentStatus === "paid",
    )
    .reduce((total, booking) => total + booking.totalPrice, 0);

  if (loading) {
    return <LoadingSpinner label="Loading earnings..." />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f1625] to-[#0a1020] p-5 sm:p-6 md:p-8">
        <h1 className="font-display text-4xl text-white sm:text-5xl">
          Earnings
        </h1>
        <p className="mt-3 text-white/50">
          Track total paid revenue and view a simple payout history from paid
          bookings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total paid"
          value={formatCurrency(totalPaid)}
          hint="Paid bookings"
        />
        <StatCard
          label="Pending payout"
          value={formatCurrency(pendingPayout)}
          hint="Confirmed and paid"
        />
        <StatCard
          label="Completed tours"
          value={completedBookings.length}
          hint="Marked completed"
        />
      </div>

      <div className="grid gap-4">
        {paidBookings.length ? (
          paidBookings.map((booking) => (
            <article
              key={booking._id}
              className="rounded-[28px] border border-white/10 bg-dark-3 p-5 shadow-sm sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl text-white sm:text-3xl">
                    {booking.tourId?.title}
                  </h2>
                  <p className="mt-2 text-white/50">
                    {booking.travelerId?.name} • {formatDate(booking.bookingDate)}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl font-semibold text-white">
                    {formatCurrency(booking.totalPrice)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 sm:justify-end">
                    <StatusPill value={booking.status} />
                    <StatusPill value={booking.paymentStatus} />
                  </div>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            title="No earnings yet"
            description="Paid guide bookings will appear here once you start confirming tours."
          />
        )}
      </div>
    </div>
  );
};

export default EarningsPage;
