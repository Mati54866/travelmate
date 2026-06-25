// dashboard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarDays,
  CircleDollarSign,
  Compass,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  ShieldCheck,
  Star,
  Users,
  X,
  Plus,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  PieChart,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusPill from "../../components/common/StatusPill";
import { BrandMark } from "../../components/branding/BrandLogo";
import { bookingsApi, guidesApi, toursApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  readResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

// Clean dark panels - subtle shadows, no borders
const panelClass =
  "rounded-2xl bg-[#0a1020] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]";

const sidebarLinks = [
  { label: "Dashboard", icon: LayoutDashboard, target: "dashboard" },
  { label: "Bookings", icon: CalendarDays, target: "bookings" },
  { label: "Availability", icon: Compass, target: "profile" },
  { label: "Earnings", icon: CircleDollarSign, target: "earnings" },
  { label: "Reviews", icon: Star, target: "performance" },
  { label: "Messages", icon: MessageSquare, target: "actions" },
  { label: "Analytics", icon: BarChart3, target: "overview" },
  { label: "Settings", icon: Settings, target: "profile" },
];

const statTones = {
  green: "bg-[#75d780]/15 text-[#8ceb97]",
  blue: "bg-[#5c86ff]/15 text-[#84a8ff]",
  orange: "bg-[#ff9d43]/15 text-[#ffbf7a]",
  purple: "bg-[#b788ff]/15 text-[#d0b5ff]",
};

const StatTile = ({ icon: Icon, label, value, hint, tone }) => (
  <article
    className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)]`}
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
          {label}
        </p>
        <p className="mt-2 text-[28px] font-semibold leading-none text-white">
          {value}
        </p>
        <p className="mt-2 text-xs text-white/40">{hint}</p>
      </div>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${statTones[tone]}`}
      >
        <Icon className="h-4 w-4" />
      </div>
    </div>
  </article>
);

const SparklineChart = ({ data }) => {
  const width = 420;
  const height = 160;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((value, index) => {
      const x = index * stepX;
      const y = height - ((value - min) / range) * (height - 24) - 12;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-44 w-full">
      <defs>
        <linearGradient id="earningsFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#5f8fff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#5f8fff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((line) => (
        <line
          key={line}
          x1="0"
          x2={width}
          y1={20 + line * 36}
          y2={20 + line * 36}
          stroke="rgba(255,255,255,0.05)"
          strokeDasharray="5 7"
        />
      ))}
      <polygon points={areaPoints} fill="url(#earningsFill)" />
      <polyline
        points={points}
        fill="none"
        stroke="#5f8fff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {data.map((value, index) => {
        const x = index * stepX;
        const y = height - ((value - min) / range) * (height - 24) - 12;
        return (
          <circle
            key={`${value}-${index}`}
            cx={x}
            cy={y}
            r="4"
            fill="#9bb8ff"
            stroke="#0a1020"
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
};

const DonutChart = ({ confirmed, pending, completed, cancelled }) => {
  const segments = [
    { value: completed, color: "#75d780" },
    { value: confirmed, color: "#38bdf8" },
    { value: pending, color: "#f59e0b" },
    { value: cancelled, color: "#f87171" },
  ];
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
        <defs>
          <filter id="donutGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="16"
        />
        {segments.map((segment) => {
          const dash = (segment.value / total) * circumference;
          const gap = 4;
          const element = (
            <circle
              key={segment.color}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth="16"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(0, dash - gap)} ${circumference - Math.max(0, dash - gap)}`}
              strokeDashoffset={-offset}
              filter="url(#donutGlow)"
            />
          );
          offset += dash;
          return element;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{total}</span>
        <span className="text-[10px] uppercase tracking-[0.24em] text-white/40 mt-0.5">
          Total
        </span>
      </div>
    </div>
  );
};

const MetricRow = ({ dot, label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <div className="flex items-center gap-2 text-white/55">
      <span
        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
        style={{ background: dot, boxShadow: `0 0 6px ${dot}99` }}
      />
      <span>{label}</span>
    </div>
    <span className="font-semibold text-sm tabular-nums" style={{ color: dot }}>
      {value}
    </span>
  </div>
);

const BookingsOverviewChart = () => {
  const width = 400;
  const height = 180;

  const points = [
    { x: 40, y: 107, label: "May 15" },
    { x: 125, y: 72, label: "May 22" },
    { x: 210, y: 37, label: "May 29" },
    { x: 295, y: 55, label: "Jun 5" },
    { x: 380, y: 33, label: "Jun 12" },
  ];

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `40,150 ${polylinePoints} 380,150`;

  return (
    <article
      className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.5)]`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
            Bookings Overview
          </p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[28px] font-semibold leading-none text-white">
              23
            </span>
            <span className="text-xs text-white/40">Total Bookings</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button className="flex items-center gap-1 rounded-lg bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/60 hover:bg-white/10 hover:text-white transition">
            <span>Last 30 Days</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="mt-1 flex items-center gap-1 text-right">
            <span className="flex items-center gap-0.5 text-xs font-semibold text-[#8ceb97]">
              <TrendingUp className="h-3.5 w-3.5" />
              22%
            </span>
            <span className="text-[10px] text-white/40">vs last 30 days</span>
          </div>
        </div>
      </div>

      <div className="mt-5 w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          <defs>
            <linearGradient id="bookingsFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#75d780" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#75d780" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[
            { y: 20, label: "30" },
            { y: 63, label: "20" },
            { y: 107, label: "10" },
            { y: 150, label: "0" },
          ].map((line, idx) => (
            <g key={idx}>
              <text
                x="25"
                y={line.y + 4}
                textAnchor="end"
                className="text-[10px] fill-white/40 font-medium"
              >
                {line.label}
              </text>
              <line
                x1="40"
                x2="380"
                y1={line.y}
                y2={line.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="4 6"
              />
            </g>
          ))}

          <polygon points={areaPoints} fill="url(#bookingsFill)" />

          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#75d780"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((p, idx) => (
            <circle
              key={idx}
              cx={p.x}
              cy={p.y}
              r="4.5"
              fill="#8ceb97"
              stroke="#0a1020"
              strokeWidth="2.5"
            />
          ))}

          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y="172"
              textAnchor="middle"
              className="text-[10px] fill-white/40 font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  );
};

const GuideDashboardPage = () => {
  const cachedGuide = readResourceCache("guideProfile");
  const cachedGuideBookings = readResourceCache("guideBookings");
  const cachedGuideTours = readResourceCache("guideTours");
  const [guide, setGuide] = useState(cachedGuide ?? null);
  const [bookings, setBookings] = useState(cachedGuideBookings ?? []);
  const [tours, setTours] = useState(cachedGuideTours ?? []);
  const [loading, setLoading] = useState(
    !cachedGuide && !cachedGuideBookings && !cachedGuideTours,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
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
        if (!cachedGuide && !cachedGuideBookings && !cachedGuideTours) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const responses = await Promise.allSettled([
          guidesApi.getMyProfile(),
          bookingsApi.getGuideBookings(),
          toursApi.getMyTours(),
        ]);

        if (ignore) return;

        const [guideResult, bookingsResult, toursResult] = responses;

        const nextGuide =
          guideResult.status === "fulfilled"
            ? guideResult.value.data.guide
            : null;
        const nextBookings =
          bookingsResult.status === "fulfilled"
            ? bookingsResult.value.data.bookings || []
            : [];
        const nextTours =
          toursResult.status === "fulfilled"
            ? toursResult.value.data.tours || []
            : [];

        setGuide(nextGuide);
        setBookings(nextBookings);
        setTours(nextTours);
        writeResourceCache("guideProfile", nextGuide);
        writeResourceCache("guideBookings", nextBookings);
        writeResourceCache("guideTours", nextTours);

        if (
          bookingsResult.status === "rejected" ||
          toursResult.status === "rejected"
        ) {
          setError("Some dashboard data could not be loaded.");
        } else {
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(
            getErrorMessage(requestError, "Unable to load guide dashboard."),
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

  const paidBookings = useMemo(
    () => bookings.filter((booking) => booking.paymentStatus === "paid"),
    [bookings],
  );
  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "pending"),
    [bookings],
  );
  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed"),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );
  const activeTours = useMemo(
    () => tours.filter((tour) => tour.status === "active"),
    [tours],
  );

  const confirmedRevenue = paidBookings.reduce(
    (total, booking) => total + booking.totalPrice,
    0,
  );
  const avgBookingValue = paidBookings.length
    ? Math.round(confirmedRevenue / paidBookings.length)
    : 0;
  const occupancyRate = activeTours.length
    ? Math.min(100, Math.round((bookings.length / activeTours.length) * 24))
    : 0;
  const nextBooking = [...bookings]
    .filter((booking) => ["pending", "confirmed"].includes(booking.status))
    .sort((a, b) => new Date(a.bookingDate) - new Date(b.bookingDate))[0];
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  const trendData = [320, 410, 380, 560, 610, 720, 690];

  const displayTours = useMemo(() => {
    const count = tours.length;
    if (count >= 3) return tours.slice(0, 3);
    if (count === 2) return [tours[0], tours[1], { _placeholder: "add" }];
    if (count === 1)
      return [tours[0], { _placeholder: "add" }, { _placeholder: "tip" }];
    return [
      { _placeholder: "add" },
      { _placeholder: "tip" },
      { _placeholder: "empty" },
    ];
  }, [tours]);

  if (loading) {
    return <LoadingSpinner label="Loading guide dashboard..." />;
  }

  return (
    <div className="rounded-2xl bg-[#071120] shadow-2xl overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="xl:hidden flex items-center justify-between p-4 bg-[#0a1020]">
        <div className="flex items-center gap-3">
          <BrandMark className="h-10 w-10" />
          <div>
            <p className="text-sm font-semibold text-white">TravelMate</p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
              Guide Console
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-xl bg-white/5 text-white/60 hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden xl:block w-[260px] bg-[#0a1020] px-4 py-6">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-3 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]">
            <BrandMark className="h-11 w-11" />
            <div>
              <p className="text-sm font-semibold text-white">TravelMate</p>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                Guide Console
              </p>
            </div>
          </div>

          <nav className="mt-6 grid gap-1">
            {sidebarLinks.map(({ label, icon: Icon, target }) => (
              <button
                key={label}
                type="button"
                onClick={() => focusSection(target)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                  activeSection === target
                    ? "bg-[#75d780]/10 text-[#8ceb97] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 rounded-xl bg-gradient-to-br from-[#122543] to-[#0a1020] p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[#75d780]">
              Pro Guide
            </p>
            <p className="mt-3 text-sm leading-6 text-white/60">
              Stay on top of your bookings and keep your tours performing at
              their best.
            </p>
            <Link
              to="/guide/tours"
              className="btn-primary mt-4 inline-flex text-xs"
            >
              Manage Tours
            </Link>
          </div>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileSidebarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 xl:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 h-full w-72 bg-[#0a1020] px-4 py-5 xl:hidden shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BrandMark className="h-11 w-11" />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      TravelMate
                    </p>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                      Guide Console
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-white/5 text-white/60"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="mt-6 grid gap-1">
                {sidebarLinks.map(({ label, icon: Icon, target }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      focusSection(target);
                      setMobileSidebarOpen(false);
                    }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      activeSection === target
                        ? "bg-[#75d780]/10 text-[#8ceb97]"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-6 rounded-xl bg-gradient-to-br from-[#122543] to-[#0a1020] p-4 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]">
                <p className="text-xs uppercase tracking-[0.24em] text-[#75d780]">
                  Pro Guide
                </p>
                <p className="mt-3 text-sm leading-6 text-white/60">
                  Keep bookings organized and keep your tours conversion-ready.
                </p>
                <Link
                  to="/guide/tours"
                  className="btn-primary mt-4 inline-flex text-xs"
                >
                  Manage Tours
                </Link>
              </div>
            </aside>
          </>
        )}

        <main className="flex-1 min-w-0 bg-[#071120] px-4 py-6 md:px-6 xl:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_340px]">
            <section
              id="dashboard-section"
              ref={(element) => {
                sectionRefs.current.dashboard = element;
              }}
              className="space-y-6"
            >
              <div className="flex flex-col gap-4 pb-6">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[#75d780]">
                    Welcome back
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold text-white">
                    Guide Dashboard
                  </h1>
                  <p className="mt-2 text-sm text-white/50">
                    Monitor tours, bookings, and performance in one place.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/60 hover:bg-white/10 transition shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    <Bell className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { data } = await guidesApi.toggleAvailability();
                        setGuide(data.guide);
                      } catch (toggleError) {
                        setError(
                          getErrorMessage(
                            toggleError,
                            "Unable to update availability.",
                          ),
                        );
                      }
                    }}
                    className={`inline-flex items-center gap-3 rounded-xl px-4 py-2 text-sm transition shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)] ${
                      guide?.isAvailable
                        ? "bg-[#75d780]/10 text-[#8ceb97]"
                        : "bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <span>Availability</span>
                    <span
                      className={`relative h-5 w-10 rounded-full transition ${
                        guide?.isAvailable ? "bg-[#75d780]" : "bg-white/20"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
                          guide?.isAvailable ? "left-5" : "left-0.5"
                        }`}
                      />
                    </span>
                  </button>

                  <Link
                    to="/guide/profile"
                    className="rounded-xl bg-white/5 px-5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/guide/bookings"
                    className="rounded-xl bg-white/5 px-5 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    Manage Bookings
                  </Link>
                  <Link
                    to="/guide/tours"
                    className="rounded-xl bg-[#75d780] px-5 py-2 text-xs font-bold text-[#071120] transition hover:bg-[#89e894] shadow-[0_2px_8px_-2px_rgba(117,215,128,0.3)]"
                  >
                    Manage Tours
                  </Link>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="grid gap-4 grid-cols-2 md:grid-cols-2 2xl:grid-cols-4">
                <StatTile
                  icon={Compass}
                  label="Active Tours"
                  value={activeTours.length}
                  hint={`${tours.length} total listed`}
                  tone="green"
                />
                <StatTile
                  icon={Users}
                  label="Pending Bookings"
                  value={pendingBookings.length}
                  hint="Awaiting guide action"
                  tone="blue"
                />
                <StatTile
                  icon={CircleDollarSign}
                  label="Paid Earnings"
                  value={formatCurrency(confirmedRevenue)}
                  hint={`${paidBookings.length} paid bookings`}
                  tone="orange"
                />
                <StatTile
                  icon={Star}
                  label="Guide Rating"
                  value={guide ? guide.rating.toFixed(1) : "0.0"}
                  hint={`${guide?.totalReviews || 0} total reviews`}
                  tone="purple"
                />
              </div>

              {/* Earnings & Overview Row */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_340px]">
                <div
                  id="earnings-section"
                  ref={(element) => {
                    sectionRefs.current.earnings = element;
                  }}
                  className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${
                    activeSection === "earnings"
                      ? "ring-1 ring-[#75d780]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                        Earnings Overview
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {formatCurrency(confirmedRevenue)}
                      </p>
                      <p className="mt-2 text-xs text-[#75d780]">
                        +13.5% from last period
                      </p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/50 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.3)]">
                      {refreshing ? "Refreshing" : "This month"}
                    </span>
                  </div>
                  <div className="mt-5">
                    <SparklineChart data={trendData} />
                  </div>
                  <div className="mt-2 grid grid-cols-7 text-[11px] text-white/30">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map(
                      (month) => (
                        <span key={month}>{month}</span>
                      ),
                    )}
                  </div>
                </div>

                <div
                  id="overview-section"
                  ref={(element) => {
                    sectionRefs.current.overview = element;
                  }}
                  className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${
                    activeSection === "overview"
                      ? "ring-1 ring-[#75d780]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                        Booking Status Breakdown
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">
                        {bookings.length}
                      </p>
                      <p className="mt-2 text-xs text-white/40">
                        All-time booking volume
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 shadow-[0_2px_4px_-2px_rgba(0,0,0,0.3)]">
                      <PieChart className="h-3 w-3 text-[#38bdf8]" />
                      <span className="text-[11px] text-white/50">Live</span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <DonutChart
                      confirmed={confirmedBookings.length}
                      pending={pendingBookings.length}
                      completed={completedBookings.length}
                      cancelled={
                        bookings.filter((b) => b.status === "cancelled").length
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-3">
                    <MetricRow
                      dot="#75d780"
                      label="Completed"
                      value={completedBookings.length}
                    />
                    <MetricRow
                      dot="#38bdf8"
                      label="Confirmed"
                      value={confirmedBookings.length}
                    />
                    <MetricRow
                      dot="#f59e0b"
                      label="Pending"
                      value={pendingBookings.length}
                    />
                    <MetricRow
                      dot="#f87171"
                      label="Cancelled"
                      value={
                        bookings.filter((b) => b.status === "cancelled").length
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Recent Bookings & Upcoming Booking Row */}
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                <div
                  id="bookings-section"
                  ref={(element) => {
                    sectionRefs.current.bookings = element;
                  }}
                  className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${
                    activeSection === "bookings"
                      ? "ring-1 ring-[#75d780]/30"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                        Recent Bookings
                      </p>
                      <p className="mt-2 text-sm text-white/50">
                        The most recent booking requests across all your tours.
                      </p>
                    </div>
                    <Link
                      to="/guide/bookings"
                      className="text-sm font-medium text-[#75d780] hover:text-[#8ceb97]"
                    >
                      View all
                    </Link>
                  </div>

                  {recentBookings.length ? (
                    <div className="mt-5 space-y-3">
                      {recentBookings.map((booking) => (
                        <article
                          key={booking._id}
                          className="rounded-xl bg-white/5 px-4 py-4 transition hover:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-medium text-white">
                                {booking.tourId?.title || "Tour booking"}
                              </h3>
                              <p className="mt-1 text-sm text-white/50">
                                {booking.travelerId?.name || "Traveler"} |{" "}
                                {formatDate(booking.bookingDate)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-white">
                                {formatCurrency(booking.totalPrice)}
                              </span>
                              <StatusPill value={booking.status} />
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-5">
                      <EmptyState
                        title="No bookings yet"
                        description="Booking requests will appear here as travelers schedule tours."
                      />
                    </div>
                  )}
                </div>

                <div
                  className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                        Upcoming Booking
                      </p>
                      <p className="mt-2 text-sm text-white/50">
                        Your next scheduled traveler slot will appear here.
                      </p>
                    </div>
                    <Activity className="h-4 w-4 text-white/40" />
                  </div>

                  {nextBooking ? (
                    <div className="mt-5 rounded-xl bg-white/5 p-5 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]">
                      <div className="flex items-center justify-between gap-3">
                        <StatusPill value={nextBooking.status} />
                        <span className="text-xs text-white/40">
                          {formatDate(nextBooking.bookingDate)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-medium text-white">
                        {nextBooking.tourId?.title || "Upcoming tour"}
                      </h3>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/50">Traveler</span>
                          <span className="text-white">
                            {nextBooking.travelerId?.name || "Traveler"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/50">Guests</span>
                          <span className="text-white">
                            {nextBooking.numberOfTravelers}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-white/50">Revenue</span>
                          <span className="text-white">
                            {formatCurrency(nextBooking.totalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/50">
                      No upcoming bookings scheduled at this time.
                    </div>
                  )}
                </div>
              </div>

              {/* Your Tours - quick access to guide's own tours (show up to 3) */}
              <div className={`${panelClass} p-5 transition-all duration-300`}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                      Your Tours
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Quick access to your top 3 tours for management and
                      review.
                    </p>
                  </div>
                  <Link
                    to="/guide/tours"
                    className="text-sm font-medium text-[#75d780] hover:text-[#8ceb97]"
                  >
                    Manage all
                  </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {displayTours.map((item, idx) => {
                    if (item?._placeholder === "tip") {
                      return (
                        <div
                          key={`tip-${idx}`}
                          className="rounded-xl bg-white/5 p-6 text-white/60 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)]"
                        >
                          <h3 className="font-medium text-white">
                            Pro Guide Tip
                          </h3>
                          <p className="mt-2 text-sm">
                            Guides with 3+ active tours have 40% higher booking
                            volume. Add more tours and photo galleries to
                            improve visibility.
                          </p>
                        </div>
                      );
                    }
                    if (item?._placeholder === "add") {
                      return (
                        <Link
                          key={`add-${idx}`}
                          to="/guide/tours"
                          className="rounded-xl bg-white/5 overflow-hidden transition group shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)]"
                        >
                          <div className="relative h-40 bg-gradient-to-br from-[#2a3a5a] to-[#1a2a3a] flex items-center justify-center">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#75d780] text-[#071120]">
                              <Plus className="h-6 w-6" />
                            </div>
                          </div>

                          <div className="p-4 flex items-center justify-center">
                            <div className="text-center">
                              <h3 className="font-medium text-white">
                                Add a New Tour
                              </h3>
                              <p className="text-sm text-white/50 mt-1">
                                Publish your next itinerary to get bookings.
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    }

                    // real tour card
                    const tour = item;
                    return (
                      <Link
                        key={tour._id}
                        to={`/tours/${tour._id}`}
                        className="rounded-xl bg-white/5 overflow-hidden transition group shadow-[0_8px_20px_-6px_rgba(0,0,0,0.4)] hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)]"
                      >
                        <div className="relative h-40">
                          <img
                            src={
                              tour?.images?.[0] || "/assets/feturedTour.avif"
                            }
                            alt={tour?.title || `Featured ${idx + 1}`}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
                        </div>

                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-white">
                              {tour.title}
                            </h3>
                            {tour.isSoldOut ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-[#75d780]/20 text-[#8ceb97]">
                                SOLD OUT
                              </span>
                            ) : null}
                          </div>
                          <p className="text-sm text-white/40 mt-1">
                            {tour.subtitle || ""}
                          </p>
                          <p className="text-xs text-white/30 mt-2">
                            {tour.description || ""}
                          </p>
                          <div className="mt-3 text-sm font-medium text-[#75d780] flex items-center gap-1">
                            <span>View Details</span>
                            <ArrowUpRight className="h-3 w-3" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Right Sidebar - Streamlined without duplicate profile card */}
            <aside className="space-y-6">
              <BookingsOverviewChart />
              <div
                id="performance-section"
                ref={(element) => {
                  sectionRefs.current.performance = element;
                }}
                className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${
                  activeSection === "performance"
                    ? "ring-1 ring-[#75d780]/30"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                      Performance
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Key metrics at a glance.
                    </p>
                  </div>
                  <ShieldCheck className="h-4 w-4 text-white/40" />
                </div>

                <div className="mt-5 grid gap-3">
                  <div className="rounded-xl bg-white/5 p-4 transition hover:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Avg Booking Value
                      </p>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#f59e0b]/15">
                        <DollarSign className="h-3.5 w-3.5 text-[#f59e0b]" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatCurrency(avgBookingValue)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 transition hover:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Conversion Rate
                      </p>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#38bdf8]/15">
                        <Percent className="h-3.5 w-3.5 text-[#38bdf8]" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {occupancyRate}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 transition hover:bg-white/10 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        Completed Tours
                      </p>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#75d780]/15">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#75d780]" />
                      </div>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {completedBookings.length}
                    </p>
                  </div>
                </div>
              </div>

              <div
                id="actions-section"
                ref={(element) => {
                  sectionRefs.current.actions = element;
                }}
                className={`${panelClass} p-5 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.5)] ${
                  activeSection === "actions" ? "ring-1 ring-[#75d780]/30" : ""
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.26em] text-white/50">
                      Quick Actions
                    </p>
                    <p className="mt-2 text-sm text-white/50">
                      Jump straight into common tasks.
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-white/40" />
                </div>

                <div className="mt-5 grid gap-3">
                  <Link
                    to="/guide/tours"
                    className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    Manage tours
                  </Link>
                  <Link
                    to="/guide/bookings"
                    className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    Review bookings
                  </Link>
                  <Link
                    to="/guide/profile"
                    className="rounded-xl bg-white/5 px-4 py-3 text-sm text-white/80 transition hover:bg-white/10 shadow-[0_2px_6px_-2px_rgba(0,0,0,0.3)]"
                  >
                    Update profile
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          {error && (
            <div className="mt-6">
              <EmptyState title="Partial dashboard data" description={error} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default GuideDashboardPage;
