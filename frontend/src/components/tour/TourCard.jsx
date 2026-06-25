// frontend/src/components/tour/TourCard.jsx
import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/format";

const fallbackImage = "/assets/feturedTour.avif";

const TourCard = ({ tour, variant = "vertical" }) => {
  // Handle both real tours and sample tours
  const tourId = tour._id;
  const isSample = tour.isSample === true;

  // For sample tours, show an alert that they're demo tours
  const handleCardClick = (e) => {
    if (isSample) {
      e.preventDefault();
      alert(
        `"${tour.title}" is a sample destination. Sign up or log in to book real tours!`,
      );
    }
  };

  if (variant === "horizontal") {
    return (
      <Link
        to={isSample ? "#" : `/tours/${tourId}`}
        onClick={handleCardClick}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="grid gap-6 md:grid-cols-[420px,1fr] items-stretch">
          <div className="relative h-48 md:h-48 w-full md:w-[420px]">
            <img
              src={tour.images?.[0] || fallbackImage}
              alt={tour.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-bold text-white">{tour.title}</h3>
                {tour.isSoldOut ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#75d780]/20 text-[#8ceb97]">
                    SOLD OUT
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-white/60 leading-relaxed line-clamp-3">
                {tour.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/60">
                  Duration{" "}
                  <strong className="ml-1 text-white">
                    {tour.duration} hrs
                  </strong>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 text-sm text-white/60">
                  Price{" "}
                  <strong className="ml-1 text-[#75d780]">
                    {formatCurrency(tour.pricePerPerson)}
                  </strong>
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-white/50">
                Max {tour.maxGroupSize} people
              </div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#75d780]/30 bg-transparent px-4 py-2 text-sm font-semibold text-[#75d780]">
                Explore
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={isSample ? "#" : `/tours/${tourId}`}
      onClick={handleCardClick}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-2 hover:border-[#75d780]/30 hover:shadow-xl hover:shadow-[#75d780]/5"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={tour.images?.[0] || fallbackImage}
          alt={tour.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <span className="inline-block rounded-full bg-[#75d780]/90 px-2 py-0.5 text-xs font-semibold text-[#071120]">
            {tour.duration} hours
          </span>
        </div>
        {tour.location && (
          <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white/80 backdrop-blur-sm">
            📍 {tour.location}
          </div>
        )}
        {isSample && (
          <div className="absolute left-3 top-3 rounded-full bg-amber-500/90 px-2 py-1 text-xs font-semibold text-black">
            Demo Tour
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-white transition group-hover:text-[#75d780]">
          {tour.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/50">
          {tour.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-white/40">
              Price per person
            </p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(tour.pricePerPerson)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-white/40">
              Max group
            </p>
            <p className="text-sm font-semibold text-white/80">
              {tour.maxGroupSize} people
            </p>
          </div>
        </div>

        <div className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#75d780]/30 bg-transparent py-2.5 text-sm font-semibold text-[#75d780] transition group-hover:bg-[#75d780] group-hover:text-[#071120]">
          Explore Destination
          <svg
            className="h-4 w-4"
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
        </div>
      </div>
    </Link>
  );
};

export default TourCard;
