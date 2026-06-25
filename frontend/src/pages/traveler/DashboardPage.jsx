import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  BookMarked,
  CalendarDays,
  CircleDollarSign,
  Clock,
  Compass,
  CreditCard,
  Headphones,
  Home,
  LogOut,
  MapPinned,
  Menu,
  Plane,
  Settings,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StarRating from "../../components/common/StarRating";
import StatusPill from "../../components/common/StatusPill";
import { BrandMark } from "../../components/branding/BrandLogo";
import { bookingsApi, reviewsApi, toursApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  readResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

const shellCard =
  "rounded-[20px] bg-[#0b1528] shadow-[0_10px_30px_rgba(0,0,0,0.22)]";

const sidebarItems = [
  { label: "Overview", icon: Home, target: "overview" },
  { label: "My Bookings", icon: CalendarDays, target: "bookings" },
  { label: "Upcoming Trips", icon: Plane, target: "hero" },
  { label: "Saved", icon: BookMarked, target: "saved" },
  { label: "Reviews", icon: Star, target: "reviews" },
  { label: "Profile", icon: UserRound, to: "/profile" },
  { label: "Settings", icon: Settings, to: "/profile" },
  { label: "Logout", icon: LogOut, action: "logout" },
];

const miniStatStyles = {
  green: "bg-[#13251f] text-[#7ee58f]",
  blue: "bg-[#111f36] text-[#7fb0ff]",
  yellow: "bg-[#2b2414] text-[#ffd46b]",
  purple: "bg-[#21162f] text-[#cb9cff]",
};

const MiniStat = ({ icon: Icon, label, value, tone }) => (
  <div className="rounded-2xl bg-[#0d182d] px-4 py-3">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${miniStatStyles[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">
          {label}
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

const TravelerSummaryRing = ({ count }) => (
  <div className="relative mx-auto h-36 w-36">
    <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
      <circle
        cx="70"
        cy="70"
        r="52"
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="14"
      />
      <circle
        cx="70"
        cy="70"
        r="52"
        fill="none"
        stroke="#75d780"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray="255 400"
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <Plane className="h-5 w-5 text-[#75d780]" />
      <span className="mt-2 text-3xl font-semibold text-white">{count}</span>
      <span className="text-[10px] uppercase tracking-[0.24em] text-white/35">
        Trips
      </span>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const cachedBookings = readResourceCache("travelerBookings");
  const cachedReviews = readResourceCache("travelerReviews");
  const cachedRecommendedTours = readResourceCache("travelerRecommendedTours");
  const cachedSavedTours = readResourceCache("travelerSavedTours");
  const [bookings, setBookings] = useState(cachedBookings ?? []);
  const [reviews, setReviews] = useState(cachedReviews ?? []);
  const [recommendedTours, setRecommendedTours] = useState(
    cachedRecommendedTours ?? [],
  );
  const [savedForLater, setSavedForLater] = useState(cachedSavedTours ?? []);
  const [reviewingId, setReviewingId] = useState("");
  const [reviewDraft, setReviewDraft] = useState({ rating: 5, comment: "" });
  const [loading, setLoading] = useState(
    !cachedBookings && !cachedReviews && !cachedRecommendedTours,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sectionRefs = useRef({});

  const focusSection = (target) => {
    setActiveSection(target);
    const element = sectionRefs.current[target];

    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        if (!cachedBookings && !cachedReviews && !cachedRecommendedTours) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const [
          { data: bookingsData },
          { data: reviewsData },
          { data: toursData },
        ] = await Promise.all([
          bookingsApi.getMine(),
          reviewsApi.getMine(),
          toursApi.getAll({ limit: 8 }),
        ]);

        if (!ignore) {
          const nextBookings = bookingsData.bookings || [];
          const nextReviews = reviewsData.reviews || [];
          const fetchedTours = toursData.tours || [];
          const nextRecommended = fetchedTours.slice(0, 3);
          const nextSaved = fetchedTours.slice(3, 7);

          setBookings(nextBookings);
          setReviews(nextReviews);
          setRecommendedTours(nextRecommended);
          setSavedForLater(nextSaved);
          writeResourceCache("travelerBookings", nextBookings);
          writeResourceCache("travelerReviews", nextReviews);
          writeResourceCache("travelerRecommendedTours", nextRecommended);
          writeResourceCache("travelerSavedTours", nextSaved);
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(requestError, "Unable to load your dashboard."),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };

    loadDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const upcomingBookings = useMemo(
    () =>
      bookings.filter((booking) =>
        ["pending", "confirmed"].includes(booking.status),
      ),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );
  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings],
  );
  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "cancelled"),
    [bookings],
  );
  const paidBookings = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === "paid"),
    [bookings],
  );
  const reviewedBookingIds = useMemo(
    () => new Set(reviews.map((review) => review.bookingId)),
    [reviews],
  );
  const reviewableBookings = useMemo(
    () =>
      completedBookings.filter(
        (booking) => !reviewedBookingIds.has(booking._id?.toString()),
      ),
    [completedBookings, reviewedBookingIds],
  );
  const nextBooking = useMemo(
    () =>
      [...upcomingBookings].sort(
        (a, b) => new Date(a.bookingDate) - new Date(b.bookingDate),
      )[0],
    [upcomingBookings],
  );
  const recentActivity = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt) -
            new Date(a.updatedAt || a.createdAt),
        )
        .slice(0, 4),
    [bookings],
  );
  const totalSpent = paidBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0,
  );

  const submitReview = async (bookingId) => {
    try {
      await reviewsApi.create({
        bookingId,
        rating: reviewDraft.rating,
        comment: reviewDraft.comment,
      });
      toast.success("Review submitted");
      setReviewingId("");
      setReviewDraft({ rating: 5, comment: "" });
      const { data } = await reviewsApi.getMine();
      const nextReviews = data.reviews || [];
      setReviews(nextReviews);
      writeResourceCache("travelerReviews", nextReviews);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError, "Unable to submit review."));
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading traveler dashboard..." />;
  }

  return (
    <div className="rounded-[28px] bg-[#08111f] shadow-[0_30px_90px_rgba(0,0,0,0.38)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/8 p-4 xl:hidden">
        <div className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-white">TravelMate</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
              Traveler Console
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileSidebarOpen((open) => !open)}
          className="rounded-xl border border-white/10 p-2 text-white/60"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="grid xl:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/6 bg-[#07101d] px-4 py-5 xl:block">
          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-3">
            <BrandMark className="h-10 w-10" />
            <div>
              <p className="text-sm font-semibold text-white">TravelMate</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                Traveler
              </p>
            </div>
          </div>

          <nav className="mt-6 grid gap-2">
            {sidebarItems.map(({ label, icon: Icon, target, to, action }) => {
              const baseClass = `flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm ${
                activeSection === target
                  ? "bg-[#75d780]/12 text-[#8ceb97]"
                  : "text-white/52 hover:bg-white/[0.03] hover:text-white"
              }`;

              if (to) {
                return (
                  <Link key={label} to={to} className={baseClass}>
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </Link>
                );
              }

              if (action === "logout") {
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={logout}
                    className={baseClass}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => focusSection(target)}
                  className={baseClass}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl bg-[#0d182d] p-4">
            <div className="flex items-center gap-2">
              <Headphones className="h-4 w-4 text-[#75d780]" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75d780]">
                Need Help?
              </p>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/55">
              Our support team is available to assist with any booking queries or changes.
            </p>
            <button className="btn-primary mt-4 inline-flex text-xs">
              Contact Support
            </button>
          </div>
        </aside>

        {mobileSidebarOpen ? (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 xl:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-72 border-r border-white/8 bg-[#07101d] px-4 py-5 shadow-2xl xl:hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-3 py-3">
                  <BrandMark className="h-10 w-10" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      TravelMate
                    </p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                      Traveler
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-xl border border-white/10 p-2 text-white/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 grid gap-2">
                {sidebarItems.map(
                  ({ label, icon: Icon, target, to, action }) => {
                    const baseClass = `flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm ${
                      activeSection === target
                        ? "bg-[#75d780]/12 text-[#8ceb97]"
                        : "text-white/52 hover:bg-white/[0.03] hover:text-white"
                    }`;

                    if (to) {
                      return (
                        <Link
                          key={label}
                          to={to}
                          onClick={() => setMobileSidebarOpen(false)}
                          className={baseClass}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </Link>
                      );
                    }

                    if (action === "logout") {
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() => {
                            logout();
                            setMobileSidebarOpen(false);
                          }}
                          className={baseClass}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{label}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          focusSection(target);
                          setMobileSidebarOpen(false);
                        }}
                        className={baseClass}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    );
                  },
                )}
              </nav>

              <div className="mt-8 rounded-2xl bg-[#0d182d] p-4">
                <div className="flex items-center gap-2">
                  <Headphones className="h-4 w-4 text-[#75d780]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#75d780]">
                    Need Help?
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/55">
                  Our support team is available to assist with any booking queries or changes.
                </p>
              </div>
            </aside>
          </>
        ) : null}

        <main className="bg-[#091325] px-4 py-5 md:px-6 xl:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/42">
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"}.
              </p>
              <h1 className="mt-1 text-3xl font-semibold text-white">
                Traveler Dashboard
              </h1>
            </div>
            {refreshing ? (
              <span className="rounded-full bg-white/[0.03] px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-white/35">
                Refreshing
              </span>
            ) : null}
          </div>

          <div className="mt-5">
            <section
              ref={(element) => {
                sectionRefs.current.overview = element;
              }}
              className="space-y-4"
            >
              <div
                ref={(element) => {
                  sectionRefs.current.hero = element;
                }}
                className={`${shellCard} overflow-hidden ${
                  activeSection === "hero" || activeSection === "overview"
                    ? "ring-1 ring-[#75d780]/30"
                    : ""
                }`}
              >
                <div className="grid min-h-[240px] lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#75d780]">
                      Upcoming Trip
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold leading-tight text-white sm:text-[30px]">
                      {nextBooking?.tourId?.title ||
                        "Plan your next guided day"}
                    </h2>
                    <div className="mt-4 space-y-3 text-sm text-white/58">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-[#75d780]" />
                        <span>
                          {nextBooking
                            ? formatDate(nextBooking.bookingDate)
                            : "No confirmed date yet"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPinned className="h-4 w-4 text-[#75d780]" />
                        <span>
                          {nextBooking?.tourId?.meetingPoint ||
                            "Your meeting point shows up here"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <UserRound className="h-4 w-4 text-[#75d780]" />
                        <span>
                          {nextBooking?.guideId?.userId?.name ||
                            "Guide pending"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {nextBooking ? (
                        <>
                          <Link
                            to={`/booking-confirmation/${nextBooking._id}`}
                            className="btn-primary text-xs px-5 py-2"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/tours/${nextBooking.tourId?._id}`}
                            className="btn-secondary text-xs px-5 py-2"
                          >
                            Tour Page
                          </Link>
                        </>
                      ) : (
                        <Link
                          to="/guides"
                          className="btn-primary text-xs px-5 py-2"
                        >
                          Browse Guides
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="relative hidden lg:block min-h-[240px]">
                    <img
                      src="/assets/dashboard-hero.jpg"
                      alt="Traveler dashboard hero"
                      className="h-full w-full object-cover object-center"
                    />
                    {/* Dark gradient from left so the left-panel text is always readable */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b1528]/80 via-[#0b1528]/20 to-transparent" />
                    {/* Subtle vignette on right edge */}
                    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0b1528]/30 to-transparent" />
                    <div className="absolute right-4 top-4 rounded-full bg-[#75d780]/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9bf4a7] backdrop-blur-sm border border-[#75d780]/20">
                      {nextBooking ? nextBooking.status : "Get Started"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <MiniStat
                  icon={Plane}
                  label="Upcoming"
                  value={upcomingBookings.length}
                  tone="green"
                />
                <MiniStat
                  icon={Star}
                  label="Completed"
                  value={completedBookings.length}
                  tone="blue"
                />
                <MiniStat
                  icon={Clock}
                  label="Pending"
                  value={pendingBookings.length}
                  tone="yellow"
                />
                <MiniStat
                  icon={CircleDollarSign}
                  label="Cancelled"
                  value={cancelledBookings.length}
                  tone="purple"
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
                <div
                  ref={(element) => {
                    sectionRefs.current.bookings = element;
                  }}
                  className={`${shellCard} p-5 ${
                    activeSection === "bookings"
                      ? "ring-1 ring-[#75d780]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      My Bookings
                    </h3>
                    <Link
                      to="/guides"
                      className="text-xs font-medium text-[#75d780]"
                    >
                      Browse All
                    </Link>
                  </div>

                  <div className="mt-4 space-y-3">
                    {bookings.length ? (
                      bookings.slice(0, 3).map((booking) => (
                        <article
                          key={booking._id}
                          className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3"
                        >
                          <img
                            src={
                              booking.tourId?.images?.[0] ||
                              "/assets/feturedTour.avif"
                            }
                            alt={booking.tourId?.title || "Booked tour"}
                            className="h-16 w-16 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate text-sm font-medium text-white">
                              {booking.tourId?.title || "Booked tour"}
                            </h4>
                            <p className="mt-1 text-xs text-white/40">
                              {booking.guideId?.userId?.name || "Guide"} |{" "}
                              {formatDate(booking.bookingDate)}
                            </p>
                            <p className="mt-1 text-xs text-white/28">
                              {booking.tourId?.meetingPoint ||
                                "Meeting point pending"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-white">
                              {formatCurrency(booking.totalPrice)}
                            </p>
                            <div className="mt-1 flex justify-end">
                              <StatusPill value={booking.status} />
                            </div>
                          </div>
                        </article>
                      ))
                    ) : (
                      <EmptyState
                        title="No bookings yet"
                        description="Book a guide and your trips will land here."
                      />
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className={`${shellCard} p-5`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Travel Summary
                      </h3>
                      <Compass className="h-4 w-4 text-white/35" />
                    </div>
                    <div className="mt-4 grid items-center gap-4 sm:grid-cols-[150px_1fr]">
                      <TravelerSummaryRing count={bookings.length} />
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between text-white/48">
                          <span>Total Trips</span>
                          <span className="font-medium text-white">
                            {bookings.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-white/48">
                          <span>Total Spend</span>
                          <span className="font-medium text-white">
                            {formatCurrency(totalSpent)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-white/48">
                          <span>Paid Bookings</span>
                          <span className="font-medium text-white">
                            {paidBookings.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${shellCard} p-5`}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">
                        Recent Activity
                      </h3>
                      <Sparkles className="h-4 w-4 text-white/35" />
                    </div>
                    <div className="mt-4 space-y-4">
                      {recentActivity.length ? (
                        recentActivity.map((activity) => (
                          <div key={activity._id} className="flex gap-3">
                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#75d780]" />
                            <div>
                              <p className="text-sm font-medium text-white">
                                {activity.tourId?.title || "Trip update"}
                              </p>
                              <p className="mt-1 text-xs text-white/40">
                                {activity.status} |{" "}
                                {formatDate(activity.bookingDate)}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-white/42">
                          No recent activity yet.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div
                  ref={(element) => {
                    sectionRefs.current.saved = element;
                  }}
                  className={`${shellCard} p-5 ${
                    activeSection === "saved" ? "ring-1 ring-[#75d780]/30" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                       Saved Tours
                    </h3>
                    <span className="text-xs text-[#75d780]">
                      Your wishlist
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {savedForLater.length ? (
                      savedForLater.map((tour) => (
                        <Link
                          key={tour._id}
                          to={`/tours/${tour._id}`}
                          className="overflow-hidden rounded-2xl bg-white/[0.03]"
                        >
                          <img
                            src={tour.images?.[0] || "/assets/feturedTour.avif"}
                            alt={tour.title}
                            className="h-28 w-full object-cover"
                          />
                          <div className="p-3">
                            <p className="truncate text-sm font-medium text-white">
                              {tour.title}
                            </p>
                            <p className="mt-1 text-xs text-white/38">
                              {formatCurrency(tour.pricePerPerson)}
                            </p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-white/42">
                        No saved tours yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className={`${shellCard} p-5`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Recommended For You
                    </h3>
                    <Link to="/guides" className="text-xs text-[#75d780]">
                      View all
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3">
                    {recommendedTours.length ? (
                      recommendedTours.map((tour) => (
                        <Link
                          key={tour._id}
                          to={`/tours/${tour._id}`}
                          className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-3"
                        >
                          <img
                            src={tour.images?.[0] || "/assets/feturedTour.avif"}
                            alt={tour.title}
                            className="h-14 w-14 rounded-xl object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {tour.title}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <StarRating value={4.6} />
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-[#8ceb97]">
                            {formatCurrency(tour.pricePerPerson)}
                          </span>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-white/42">
                        Recommendations will show here.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {reviewableBookings.length ? (
                <div
                  ref={(element) => {
                    sectionRefs.current.reviews = element;
                  }}
                  className={`${shellCard} p-5 ${
                    activeSection === "reviews"
                      ? "ring-1 ring-[#75d780]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">
                      Leave a Review
                    </h3>
                    <Link to="/reviews" className="text-xs text-[#75d780]">
                      Review archive
                    </Link>
                  </div>
                  <div className="mt-4 space-y-4">
                    {reviewableBookings.slice(0, 2).map((booking) => {
                      const isReviewing = reviewingId === booking._id;

                      return (
                        <article
                          key={booking._id}
                          className="rounded-2xl bg-white/[0.03] p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-medium text-white">
                                {booking.tourId?.title}
                              </h4>
                              <p className="mt-1 text-xs text-white/40">
                                With {booking.guideId?.userId?.name || "Guide"}{" "}
                                on {formatDate(booking.bookingDate)}
                              </p>
                            </div>
                            <StatusPill value={booking.status} />
                          </div>

                          {isReviewing ? (
                            <div className="mt-4 space-y-4">
                              <StarRating
                                value={reviewDraft.rating}
                                interactive
                                onChange={(rating) =>
                                  setReviewDraft((prev) => ({
                                    ...prev,
                                    rating,
                                  }))
                                }
                              />
                              <textarea
                                value={reviewDraft.comment}
                                onChange={(event) =>
                                  setReviewDraft((prev) => ({
                                    ...prev,
                                    comment: event.target.value,
                                  }))
                                }
                                placeholder="Describe your experience — what made this tour stand out?"
                                className="min-h-24 w-full rounded-2xl border border-white/10 bg-[#071120] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#75d780]/40 focus:outline-none"
                              />
                              <div className="flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={() => submitReview(booking._id)}
                                  className="btn-primary text-xs px-4 py-2"
                                >
                                  Submit Review
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewingId("");
                                    setReviewDraft({ rating: 5, comment: "" });
                                  }}
                                  className="btn-secondary text-xs px-4 py-2"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setReviewingId((current) =>
                                  current === booking._id ? "" : booking._id,
                                )
                              }
                              className="btn-primary mt-4 text-xs px-4 py-2"
                            >
                              Write a Review
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div
                ref={(element) => {
                  sectionRefs.current.support = element;
                }}
                className={`grid gap-3 md:grid-cols-3 ${
                  activeSection === "support"
                    ? "rounded-[22px] ring-1 ring-[#75d780]/30"
                    : ""
                }`}
              >
                <div className={`${shellCard} flex items-center gap-3 p-4`}>
                  <ShieldCheck className="h-5 w-5 text-[#75d780]" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Verified Guides
                    </p>
                    <p className="text-xs text-white/38">
                      All guides are background-checked and verified.
                    </p>
                  </div>
                </div>
                <div className={`${shellCard} flex items-center gap-3 p-4`}>
                  <Headphones className="h-5 w-5 text-[#75d780]" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      24/7 Support
                    </p>
                    <p className="text-xs text-white/38">
                      Dedicated support available around the clock.
                    </p>
                  </div>
                </div>
                <div className={`${shellCard} flex items-center gap-3 p-4`}>
                  <CreditCard className="h-5 w-5 text-[#75d780]" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Secure Payments
                    </p>
                    <p className="text-xs text-white/38">
                      Transactions are encrypted and fully protected.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {error ? (
              <div className="mt-4">
                <EmptyState
                  title="Partial dashboard data"
                  description={error}
                />
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
