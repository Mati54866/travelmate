import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import StarRating from "../components/common/StarRating";
import UserAvatar from "../components/common/UserAvatar";
import { guidesApi, toursApi } from "../api/services";
import { getErrorMessage } from "../utils/api";
import { formatCurrency } from "../utils/format";

const offerCards = [
  {
    number: "01",
    title: "Diverse Destinations",
    description:
      "From coastal retreats to cultural landmarks — explore destinations that match every travel style.",
    featured: false,
    image: "/assets/plane.avif",
  },
  {
    number: "02",
    title: "Everything Included",
    description: "Meals, transport, entry fees, and expert guidance — all bundled into one seamless experience.",
    featured: true,
    image: "/assets/everything%20is%20included.avif",
  },
  {
    number: "03",
    title: "Transparent Pricing",
    description:
      "Compare tours side by side and choose the option that best fits your budget and expectations.",
    featured: false,
    image: "/assets/cityBeach.avif",
  },
];

// Popular Destinations data
const popularDestinations = [
  {
    name: "Bali, Indonesia",
    subtitle: "Island of Gods",
    rating: "4.9",
    image: "/assets/Kelingking%20Beach.avif",
  },
  {
    name: "Tokyo, Japan",
    subtitle: "The Modern Tradition",
    rating: "4.9",
    image: "/assets/Temple%20Passage.avif",
  },
  {
    name: "Interlaken, Switzerland",
    subtitle: "Naturally Magical",
    rating: "4.9",
    image: "/assets/Gate%20of%20Heaven.avif",
  },
  {
    name: "Amalfi Coast, Italy",
    subtitle: "Coastal Dreams",
    rating: "4.9",
    image: "/assets/lake%20temple.avif",
  },
];

// Sample tours to show when no tours exist in database
const sampleTours = [
  {
    _id: "sample1",
    title: "Ubud Rice Terraces",
    duration: 8,
    pricePerPerson: 75,
    images: [],
    maxGroupSize: 8,
    description: "Explore the beautiful rice terraces of Ubud",
  },
  {
    _id: "sample2",
    title: "Nusa Penida Tour",
    duration: 10,
    pricePerPerson: 120,
    images: [],
    maxGroupSize: 6,
    description: "Visit the stunning cliffs and beaches of Nusa Penida",
  },
  {
    _id: "sample3",
    title: "Sunset Uluwatu",
    duration: 5,
    pricePerPerson: 55,
    images: [],
    maxGroupSize: 10,
    description: "Watch the sunset at Uluwatu Temple",
  },
  {
    _id: "sample4",
    title: "Mount Batur Trek",
    duration: 6,
    pricePerPerson: 90,
    images: [],
    maxGroupSize: 8,
    description: "Sunrise trekking at Mount Batur volcano",
  },
];

const sampleReviews = [
  {
    _id: "r1",
    name: "Ava Martin",
    avatar: "/assets/femaleAvatar.avif",
    rating: 5,
    comment:
      "Amazing experience — the guide knew all the best spots and made the day effortless.",
    location: "Sydney, AU",
  },
  {
    _id: "r2",
    name: "Carlos M.",
    avatar: "/assets/avatar1.avif",
    rating: 5,
    comment: "Well organised, on-time and truly local. Highly recommend.",
    location: "London, UK",
  },
  {
    _id: "r3",
    name: "Jenny K.",
    avatar: "/assets/femaleAvatar1.avif",
    rating: 4,
    comment: "Great value for money and excellent recommendations for food.",
    location: "Tokyo, JP",
  },
  {
    _id: "r4",
    name: "Marco S.",
    avatar: "/assets/avatar2.avif",
    rating: 5,
    comment: "A really personal touch and fantastic local stories.",
    location: "Rome, IT",
  },
];

const HomePage = () => {
  const [guides, setGuides] = useState([]);
  const [tours, setTours] = useState([]);
  const [guideTours, setGuideTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const isScrollingRef = useRef(false);

  // Create infinite carousel by duplicating reviews
  const infiniteReviews = [
    ...sampleReviews,
    ...sampleReviews,
    ...sampleReviews,
  ];
  const reviewsToShow = infiniteReviews;
  const startIndex = sampleReviews.length;
  // Card width: must match the CSS min-width exactly.
  // Main layout px-3 = 12px each side (24px total)
  // Carousel wrapper px-8 = 32px each side on mobile (64px total)
  // gap-5 between cards = 20px (we add this so scroll snaps cleanly)
  // Total non-card space on mobile = 24 + 64 = 88px; add ~16px buffer = 104px
  const getCardWidth = () => {
    if (typeof window === 'undefined') return 300;
    if (window.innerWidth < 640) return Math.max(240, window.innerWidth - 104);
    if (window.innerWidth < 768) return 300;
    return 325;
  };
  const cardWidth = getCardWidth();

  const handleCarouselScroll = (direction) => {
    const el = carouselRef.current;
    if (!el || isScrollingRef.current) return;

    isScrollingRef.current = true;
    el.scrollBy({ left: cardWidth * direction, behavior: "smooth" });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  // Handle infinite carousel looping
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    // Set initial scroll position to the start of the "real" reviews
    carousel.scrollLeft = startIndex * cardWidth;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;

      // If scrolled to the end of the first duplicate set, jump to the real set
      if (scrollLeft >= sampleReviews.length * cardWidth * 2 - 100) {
        carousel.scrollLeft = startIndex * cardWidth;
      }
      // If scrolled to the beginning of the first duplicate set, jump to the real set
      else if (scrollLeft <= startIndex * cardWidth - 100) {
        carousel.scrollLeft =
          startIndex * cardWidth + (sampleReviews.length * cardWidth - 100);
      }
    };

    carousel.addEventListener("scroll", handleScroll);
    return () => carousel.removeEventListener("scroll", handleScroll);
  }, []);

  // Determine a featured tour to show in the Recommended tour card - pick random from available tours
  const featuredTour = (() => {
    const availableTours = tours?.filter((t) => !t.isSample) || tours || [];
    if (availableTours.length === 0) return null;
    return availableTours[Math.floor(Math.random() * availableTours.length)];
  })();

  // Navigate to tour details (used by Book Now buttons)
  const handleBook = (tour) => {
    if (!tour || !tour._id) {
      alert("Tour not available");
      return;
    }
    navigate(`/tours/${tour._id}`);
  };

  useEffect(() => {
    let ignore = false;

    const loadHome = async () => {
      try {
        setLoading(true);
        const [{ data: toursData }, { data: guidesData }] = await Promise.all([
          toursApi.getAll({ limit: 8 }),
          guidesApi.getAll({ limit: 4, rating: 4 }),
        ]);

        if (!ignore) {
          const fetchedTours = toursData.tours || [];
          setTours(fetchedTours.length > 0 ? fetchedTours : sampleTours);
          setGuides(guidesData.guides || []);

          const topGuides = (guidesData.guides || []).slice(0, 4);
          if (topGuides.length) {
            try {
              const guideToursResp = await Promise.all(
                topGuides.map((g) => guidesApi.getTours(g._id)),
              );

              const firstTours = guideToursResp
                .map((r) =>
                  r.data && Array.isArray(r.data.tours)
                    ? r.data.tours[0]
                    : null,
                )
                .filter(Boolean);

              const unique = [];
              const seen = new Set();
              for (const t of firstTours) {
                if (!t || !t._id) continue;
                if (!seen.has(t._id)) {
                  seen.add(t._id);
                  unique.push(t);
                }
              }

              const result = [];
              const seenImages = new Set();
              for (const t of unique) {
                if (result.length >= 4) break;
                const img = t?.images?.[0] || "/assets/feturedTour.avif";
                if (seenImages.has(img)) continue;
                seenImages.add(img);
                result.push(t);
              }

              if (result.length < 4) {
                const fallback = fetchedTours.concat(sampleTours || []);
                for (const t of fallback) {
                  if (result.length >= 4) break;
                  if (!t || !t._id) continue;
                  if (result.find((r) => r._id === t._id)) continue;
                  const img = t?.images?.[0] || "/assets/feturedTour.avif";
                  if (seenImages.has(img)) continue;
                  seenImages.add(img);
                  result.push(t);
                }
              }

              setGuideTours(result);
            } catch (e) {
              // ignore guide tours failure; not critical
            }
          }
        }
      } catch (requestError) {
        if (!ignore) {
          setTours(sampleTours);
          setError(
            getErrorMessage(
              requestError,
              "Unable to load TravelMate highlights right now.",
            ),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadHome();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-10 pb-10 sm:space-y-12">
      {/* Top Section - Full width */}
      <article className="travel-panel overflow-hidden">
        <div className="relative min-h-[620px] overflow-hidden rounded-[24px] bg-[#071120] sm:min-h-[700px] lg:min-h-[760px] sm:rounded-[30px]">
          <img
            src="/assets/hero.png"
            alt="Temple landscape at sunset"
            className="absolute inset-0 h-full w-full object-cover opacity-60 object-[70%_top] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#071120]/70 via-[#071120]/20 to-[#071120]/80 sm:from-[#071120]/50 sm:via-[#071120]/30 sm:to-[#071120]/50" />
          <div className="relative z-10 flex min-h-[620px] flex-col p-5 sm:min-h-[700px] sm:p-8 lg:min-h-[760px] lg:p-10">
            <div className="max-w-[380px]">
              <p className="text-xs uppercase tracking-[0.34em] text-white/80">
                TravelMate curated journeys
              </p>
              <h1 className="mt-4 max-w-[360px] font-display text-4xl leading-[0.92] text-white sm:text-5xl lg:text-6xl">
                We Take Care of Your Trip
              </h1>
              <p className="mt-4 max-w-[320px] text-sm leading-6 text-white/80">
                We believe in providing the best possible travel experience.
                Whether you're looking for a romantic getaway or an
                adventure-filled vacation, we've got you covered.
              </p>
              <Link
                to="/guides"
                className="mt-8 inline-flex items-center gap-3 rounded-md bg-[#41d28d] px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-[#08131f] transition hover:bg-[#54e39f]"
              >
                Book a trip
                <span aria-hidden="true">›</span>
              </Link>
            </div>

            {/* Hero Stats Icons */}
            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5 sm:mt-12 sm:grid-cols-2 sm:gap-5 sm:pt-8 lg:grid-cols-4 lg:gap-8">
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 sm:h-7 sm:w-7 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">25k+</p>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">
                    Happy Travelers
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 sm:h-7 sm:w-7 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">40k+</p>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">Total Bookings</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 sm:h-7 sm:w-7 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">25k+</p>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">Transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <div className="flex h-10 w-10 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 sm:h-7 sm:w-7 text-[#75d780]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg sm:text-2xl font-bold text-white">4.5</p>
                  <p className="text-[11px] sm:text-xs text-white/60 mt-0.5">Average Rating</p>
                </div>
              </div>
            </div>

            {/* Offer Cards Section */}
            <div className="mt-8 rounded-[22px] bg-[#081221]/90 p-4 backdrop-blur-sm sm:rounded-[26px] sm:p-6">
              <div className="text-center">
                <h2 className="font-display text-2xl text-white sm:text-3xl">
                  What We Offer
                </h2>
                <p className="mt-3 text-sm text-white/70">
                  Discover a curated range of travel experiences designed to make every journey memorable, from group adventures to private guided tours.
                </p>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {offerCards.map((card) => (
                  <article
                    key={card.number}
                    className={`rounded-sm p-5 ${
                      card.featured
                        ? "bg-[#75d780] text-[#09111d]"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    <p
                      className={`text-sm ${card.featured ? "text-[#152232]/80" : "text-white/60"}`}
                    >
                      {card.number}
                    </p>
                    <div className="mt-5 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="max-w-[130px] text-xl font-semibold leading-6">
                          {card.title}
                        </h3>
                        <p
                          className={`mt-4 text-sm leading-6 ${
                            card.featured
                              ? "text-[#152232]/90"
                              : "text-white/70"
                          }`}
                        >
                          {card.description}
                        </p>
                      </div>
                      {card.image ? (
                        <img
                          src={card.image}
                          alt={card.title}
                          className="h-20 w-20 rounded-sm object-cover"
                        />
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>

      {/* Popular Destinations Section */}
      <section className="travel-panel rounded-[24px] bg-[#071120] p-5 sm:rounded-[30px] sm:p-8">
        <div className="text-center">
          <h2 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">
            Popular Destinations
          </h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(guideTours.length ? guideTours : popularDestinations).map(
            (item, idx) => {
              const isTour = Boolean(item._id || item.title);
              const key = isTour ? item._id || `tour-${idx}` : item.name;
              const image = isTour
                ? item.images?.[0] || "/assets/feturedTour.avif"
                : item.image;
              const title = isTour ? item.title : item.name;
              const subtitle = isTour ? item.description : item.subtitle;

              return (
                <div
                  key={key}
                  className="group overflow-hidden rounded-xl border border-white/10 bg-dark-3 transition hover:border-[#75d780]/30 hover:shadow-lg"
                >
                  <div className="relative mt-4">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={image}
                        alt={title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white text-base">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">{subtitle}</p>
                    <button
                      onClick={() =>
                        isTour ? handleBook(item) : navigate("/guides")
                      }
                      className="mt-3 w-full rounded-md bg-[#75d780]/20 py-2 text-sm font-semibold text-[#75d780] transition hover:bg-[#75d780] hover:text-[#071120]"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {/* Tours List */}
        <div className="mt-10 grid gap-4 overflow-hidden lg:grid-cols-[0.84fr,1.16fr]">
          {/* Popular Tours Card */}
          <div className="min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,#152235_0%,#0a1426_100%)] p-5 flex flex-col gap-4">
            {/* Card Header */}
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-[#75d780]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <h3 className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                Popular Tours
              </h3>
            </div>

            {/* Tour Rows */}
            <div className="flex flex-col gap-2">
              {loading ? (
                <div className="rounded-xl bg-white/5 p-5 text-center text-sm text-white/60">
                  Loading tours...
                </div>
              ) : tours.length > 0 ? (
                tours.slice(0, 4).map((tour, index) => (
                  <Link
                    key={tour._id}
                    to={tour.isSample ? "#" : `/tours/${tour._id}`}
                    onClick={(e) => {
                      if (tour.isSample) {
                        e.preventDefault();
                        navigate("/register");
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                      index === 1
                        ? "bg-[#75d780] text-[#08131f]"
                        : "bg-white/5 text-white hover:bg-white/10"
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="h-11 w-14 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={tour.images?.[0] || "/assets/feturedTour.avif"}
                        alt={tour.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold leading-4">
                        {tour.duration}H Tour
                      </p>
                      <p
                        className={`mt-0.5 text-xs truncate ${index === 1 ? "text-[#152232]/80" : "text-white/50"}`}
                      >
                        {tour.title}
                        {tour.isSample && (
                          <span className="ml-1 text-[10px]">(Demo)</span>
                        )}
                      </p>
                    </div>
                    {/* Price */}
                    <p className="text-sm font-bold flex-shrink-0">
                      {formatCurrency(tour.pricePerPerson)}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-xl bg-white/5 p-4 text-sm text-white/60">
                  Tours will appear here once guides publish them.
                </div>
              )}
            </div>

            {/* View All Tours Link */}
            <Link
              to="/guides"
              className="mt-auto flex items-center gap-2 text-sm font-semibold text-[#75d780] hover:text-[#54e39f] transition group"
            >
              View All Tours
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Why TravelMate? Panel */}
          <div className="min-w-0 overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,#152235_0%,#0a1426_100%)] p-5 sm:p-6 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-[#75d780]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <h3 className="text-xs font-bold uppercase tracking-[0.28em] text-white/80">
                Why TravelMate?
              </h3>
            </div>
            <p className="text-xs text-white/50 leading-5 -mt-2 break-words">
              We make travel simple, safe and unforgettable with trusted local experts by your side.
            </p>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2">
              {/* Verified Local Guides */}
              <div className="rounded-[14px] bg-white/5 p-3.5 flex flex-col gap-2 hover:bg-white/8 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75d780]/15">
                  <svg
                    className="h-4 w-4 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white leading-4">
                  Verified Local Guides
                </p>
                <p className="text-[11px] text-white/45 leading-4">
                  Verified &amp; background-checked for safety.
                </p>
              </div>

              {/* Secure Payments */}
              <div className="rounded-[14px] bg-white/5 p-3.5 flex flex-col gap-2 hover:bg-white/8 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75d780]/15">
                  <svg
                    className="h-4 w-4 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white leading-4">
                  Secure Payments
                </p>
                <p className="text-[11px] text-white/45 leading-4">
                  Protected with industry-leading encryption.
                </p>
              </div>

              {/* Real Traveler Reviews */}
              <div className="rounded-[14px] bg-white/5 p-3.5 flex flex-col gap-2 hover:bg-white/8 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75d780]/15">
                  <svg
                    className="h-4 w-4 text-[#75d780]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white leading-4">
                  Real Traveler Reviews
                </p>
                <p className="text-[11px] text-white/45 leading-4">
                  See real reviews from travelers who've been there.
                </p>
              </div>

              {/* Flexible Cancellation */}
              <div className="rounded-[14px] bg-white/5 p-3.5 flex flex-col gap-2 hover:bg-white/8 transition">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#75d780]/15">
                  <svg
                    className="h-4 w-4 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-white leading-4">
                  Flexible Cancellation
                </p>
                <p className="text-[11px] text-white/45 leading-4">
                  Cancel up to 24h before for a full refund.
                </p>
              </div>
            </div>

            {/* Social Proof Footer */}
            <div className="mt-1 flex items-center gap-2 rounded-[14px] bg-white/5 p-3 overflow-hidden relative min-w-0">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-2 flex-shrink-0">
                <img
                  src="/assets/avatar1.avif"
                  alt="traveler"
                  className="h-8 w-8 rounded-full border-2 border-[#152235] object-cover"
                />
                <img
                  src="/assets/avatar2.avif"
                  alt="traveler"
                  className="h-8 w-8 rounded-full border-2 border-[#152235] object-cover"
                />
                <img
                  src="/assets/femaleAvatar.avif"
                  alt="traveler"
                  className="h-8 w-8 rounded-full border-2 border-[#152235] object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-3 w-3 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] text-white/60 mt-0.5 leading-4">
                  Trusted by{" "}
                  <span className="text-white font-semibold">5,000+</span>
                  <br className="xs:hidden" />{" "}
                  <span className="hidden xs:inline">travelers worldwide</span>
                  <span className="xs:hidden">worldwide</span>
                </p>
              </div>
              {/* Decorative travel image */}
              <img
                src="/assets/Kelingking%20Beach.avif"
                alt="destination"
                className="absolute right-0 top-0 h-full w-24 object-cover opacity-30 rounded-r-[14px]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Experience More Than Just a Trip */}
      <section className="travel-panel rounded-[24px] bg-[#071120] p-5 sm:rounded-[30px] sm:p-8">
        <div className="grid items-center gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-[18px]">
            <img
              src={`${import.meta.env.BASE_URL}assets/girlbg.png`}
              alt="Experience more than a trip"
              className="h-60 w-full rounded-[14px] object-cover sm:h-72"
            />
          </div>

          <div>
            <h2 className="font-display text-3xl text-white sm:text-4xl md:text-5xl">
              Experience More Than Just a Trip
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
              We focus on real connections, local experiences, and thoughtful
              planning that makes every journey unforgettable.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[14px] bg-[#0c1724] p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                    Local Experts
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/80">
                    Guides who know the area intimately
                  </p>
                </div>
              </div>
              <div className="rounded-[14px] bg-[#0c1724] p-4 flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#75d780]/20">
                  <svg
                    className="h-5 w-5 text-[#75d780]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7a4 4 0 018 0v1a4 4 0 01-8 0V7zM21 21v-2a4 4 0 00-4-4H9"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                    Customized Tours
                  </p>
                  <p className="mt-2 text-sm font-medium text-white/80">
                    Tailored itineraries for every type of traveler
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading and Error States */}
      {loading ? (
        <LoadingSpinner label="Loading featured travel data..." />
      ) : null}
      {!loading && error ? (
        <EmptyState title="Home feed unavailable" description={error} />
      ) : null}

      {/* Bottom Cards Section (Featured Guide & Recommended Tour) */}
      {!loading && !error && (
        <>
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Featured Guide Card - Layout matching the image */}
            <div className="travel-panel rounded-[24px] bg-[#081120] p-5 text-white sm:rounded-[30px] sm:p-8 h-full flex flex-col">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                FEATURED GUIDE
              </p>
              {guides[0] ? (
                <div className="mt-6 flex-1 flex flex-col">
                  {/* Guide Header with Avatar and Name */}
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <UserAvatar
                        user={guides[0].userId}
                        alt={guides[0].userId?.name}
                        imageClassName="h-20 w-20 rounded-[16px] object-cover"
                        fallbackClassName="flex h-20 w-20 items-center justify-center rounded-[16px] bg-white/5 text-2xl font-semibold text-white/60"
                      />
                    </div>

                    {/* Guide Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-semibold">
                          {guides[0].userId?.name}
                        </h3>
                        {guides[0].verificationStatus === "verified" && (
                          <svg
                            className="h-5 w-5 text-[#75d780]"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">
                        {guides[0].verificationStatus === "verified"
                          ? "Verified Guide"
                          : "Guide"}
                      </p>
                      <p className="text-sm text-white/80 mt-2">
                        {guides[0].operatingCities?.join(", ")}
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-4 text-sm text-white/70 leading-relaxed line-clamp-2">
                    {guides[0].bio}
                  </p>

                  {/* Specialties Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {guides[0].specialties?.slice(0, 3).map((specialty) => {
                      const getIcon = (spec) => {
                        switch (spec.toLowerCase()) {
                          case "temple tours":
                            return (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                              </svg>
                            );
                          case "wellness":
                            return (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                              </svg>
                            );
                          case "photography":
                            return (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                              </svg>
                            );
                          default:
                            return (
                              <svg
                                className="h-3.5 w-3.5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            );
                        }
                      };

                      return (
                        <span
                          key={specialty}
                          className="rounded-full border border-[#75d780]/25 bg-[#75d780]/10 px-3 py-1 text-xs font-medium text-[#75d780] inline-flex items-center gap-1.5"
                        >
                          {getIcon(specialty)}
                          {specialty}
                        </span>
                      );
                    })}
                  </div>

                  {/* Stats - 4 columns matching image */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-[#75d780]"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                          RATING
                        </p>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {guides[0].rating?.toFixed(1) || "4.9"}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {guides[0].totalReviews || 0} reviews
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-[#75d780]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 13H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1zM7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM20 3H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1zM7 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                        </svg>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                          EXPERIENCE
                        </p>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {guides[0].yearsOfExperience || 8}y
                      </p>
                      <p className="text-[10px] text-white/40">
                        On-the-ground guiding
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-3.5 w-3.5 text-[#75d780]"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                        </svg>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                          LANGUAGES
                        </p>
                      </div>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {guides[0].languages?.length || 2}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {guides[0].languages?.slice(0, 2).join(", ") ||
                          "English, Bahasa"}
                      </p>
                    </div>
                    <div className="rounded-[12px] border border-white/10 bg-white/[0.03] p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <svg
                            className="h-3.5 w-3.5 text-[#75d780]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-white/45">
                            STATUS
                          </p>
                        </div>
                        <div className="h-1.5 w-1.5 rounded-full bg-[#75d780] animate-pulse" />
                      </div>
                      <p className="mt-1 text-base font-semibold text-[#75d780]">
                        {guides[0].isAvailable ? "Available" : "Offline"}
                      </p>
                      <p className="text-[10px] text-white/40">
                        Verified guide
                      </p>
                    </div>
                  </div>

                  {/* Hourly Rate and View Profile Button */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-white/45">
                        HOURLY RATE
                      </p>
                      <p className="text-xl font-semibold text-white">
                        {formatCurrency(guides[0].hourlyRate)}
                        <span className="text-sm text-white/40">/hour</span>
                      </p>
                    </div>
                    <Link
                      to={`/guides/${guides[0]._id}`}
                      className="rounded-md bg-[#75d780] px-5 py-2 text-sm font-bold text-[#08131f] transition hover:bg-[#89e894]"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-white/60">
                  Guide recommendations will appear once profiles are available.
                </p>
              )}
            </div>

            {/* Recommended Tour Card - Layout matching the image */}
            {/* Recommended Tour Card - Layout matching the image with image on right */}
            <div className="travel-panel rounded-[24px] bg-[#081120] p-5 text-white sm:rounded-[30px] sm:p-8 h-full flex flex-col">
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                RECOMMENDED TOUR
              </p>
              {featuredTour && !featuredTour.isSample ? (
                <div className="mt-6 flex flex-col gap-5 flex-1 sm:flex-row sm:gap-6">
                  {/* Left side - Tour Image */}
                  <div className="w-full sm:flex-1 sm:basis-2/5 min-w-0">
                    <div className="relative h-44 sm:h-full rounded-[16px] overflow-hidden bg-[#07101d]">
                      <img
                        src={
                          featuredTour.images?.[0] || "/assets/feturedTour.avif"
                        }
                        alt={featuredTour.title}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute left-2 top-2 rounded-md bg-[#081120]/90 px-2 py-1 text-xs font-semibold text-[#75d780]">
                        From {formatCurrency(featuredTour.pricePerPerson)}
                      </div>
                    </div>
                  </div>

                  {/* Right side - Tour Content */}
                  <div className="w-full sm:flex-1 sm:basis-3/5 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-white leading-tight">
                        {featuredTour.title}
                      </h3>

                      {/* Description */}
                      <p className="mt-2 text-sm text-white/70 leading-relaxed line-clamp-3">
                        {featuredTour.description}
                      </p>

                      {/* Tour Stats - with icons */}
                      <div className="mt-4 flex flex-wrap items-center gap-4 sm:gap-8">
                        <div className="flex items-center gap-3">
                          <svg
                            className="h-6 w-6 text-[#75d780]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.99 5V1h-12v4h12zm6.93 0V2.5h-2v2.5h2zm0 16v-2.5h-2v2.5h2zm-6.93 0v-4h-12v4h12z" />
                          </svg>
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">
                              Duration
                            </p>
                            <p className="text-base font-semibold text-white">
                              {featuredTour.duration}h
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg
                            className="h-6 w-6 text-[#75d780]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
                          </svg>
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">
                              Group size
                            </p>
                            <p className="text-base font-semibold text-white">
                              {featuredTour.maxGroupSize || 8}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <svg
                            className="h-6 w-6 text-[#75d780]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                          </svg>
                          <div>
                            <p className="text-[9px] uppercase tracking-[0.15em] text-white/40">
                              Price
                            </p>
                            <p className="text-base font-bold text-[#75d780]">
                              {formatCurrency(featuredTour.pricePerPerson)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Inclusions */}
                      <div className="mt-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-semibold mb-2">
                          Inclusions
                        </p>
                        <ul className="space-y-1">
                          {[
                            "Local Tastings (4x unique dishes)",
                            "Private Driver and Vehicle",
                            "Hidden Cafe Entry Fees",
                            "Photography Stops with Guide",
                          ].map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-white/70 flex items-start gap-2"
                            >
                              <span className="text-[#75d780] mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-6">
                      <Link
                        to={`/tours/${featuredTour._id}`}
                        className="w-full rounded-md bg-[#75d780] px-6 py-2.5 text-sm font-bold text-[#081120] transition hover:bg-[#89e894] flex items-center justify-center gap-2"
                      >
                        View Tour Details
                        <svg
                          className="h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-white/65">
                  Featured tours will appear here when guides publish them.
                </p>
              )}
            </div>
          </section>

          {/* Trust Badges Row - Bottom of page */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border border-white/10 rounded-[24px] bg-white/[0.02] p-6 sm:p-8">
            <div>
              <p className="text-[11px] font-semibold text-white">
                Trusted Guides
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                All guides are verified and reviewed
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">
                Best Price Guarantee
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Get the best value for your experience
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">
                24/7 Support
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                We're here to help anytime, anywhere
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white">
                Free Cancellation
              </p>
              <p className="text-[10px] text-white/40 mt-0.5">
                Cancel up to 24h before the tour starts
              </p>
            </div>
          </div>

          {/* What Travelers Say Carousel */}
          <div className="mt-6">
            <div className="text-center mb-8">
              <h3 className="font-display text-2xl text-white">
                What Travelers Say
              </h3>
              <p className="text-sm text-white/40 mt-2">
                Real feedback from recent trips
              </p>
            </div>

            <div className="relative max-w-[1200px] mx-auto px-8 sm:px-16">
              {/* Left Button */}
              <button
                type="button"
                onClick={() => handleCarouselScroll(-1)}
                className="absolute -left-1 sm:-left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#0a1020] border border-white/10 p-2 sm:p-3 text-white/60 transition hover:bg-white/10 hover:text-white shadow-lg"
                aria-label="Previous"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Carousel Container */}
              <div
                ref={carouselRef}
                className="flex gap-5 overflow-x-hidden"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                  scrollBehavior: "smooth",
                  overflowX: "hidden",
                }}
              >
                <style>{`
                  .no-scrollbar::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                {reviewsToShow.map((review, i) => (
                  <div
                    key={`review-${i}`}
                    className="flex-shrink-0 rounded-2xl border border-white/10 bg-[#0a1020] p-5 sm:p-6 transition hover:border-[#75d780]/30 hover:shadow-xl"
                    style={{
                      minWidth: cardWidth,
                      width: cardWidth,
                    }}
                  >
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, starIndex) => (
                        <svg
                          key={starIndex}
                          className={`h-5 w-5 ${
                            starIndex < review.rating
                              ? "text-[#75d780] fill-[#75d780]"
                              : "text-white/20 fill-white/20"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>

                    {/* Review Comment */}
                    <p className="text-white/70 leading-relaxed text-sm mb-4 line-clamp-3">
                      "{review.comment}"
                    </p>

                    {/* Reviewer Info */}
                    <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-sm font-semibold text-white">
                          {review.name}
                        </h4>
                        <p className="text-xs text-white/40">
                          {review.location}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Button */}
              <button
                type="button"
                onClick={() => handleCarouselScroll(1)}
                className="absolute -right-1 sm:-right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#0a1020] border border-white/10 p-2 sm:p-3 text-white/60 transition hover:bg-white/10 hover:text-white shadow-lg"
                aria-label="Next"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;
