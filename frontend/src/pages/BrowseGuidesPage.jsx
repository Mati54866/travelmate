import { useEffect, useRef, useState } from "react";
import { MapPinned, Search, SlidersHorizontal } from "lucide-react";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import Pagination from "../components/common/Pagination";
import SearchFilters from "../components/common/SearchFilters";
import GuideCard from "../components/tour/GuideCard";
import { guidesApi } from "../api/services";
import { getErrorMessage } from "../utils/api";
import { readResourceCache, writeResourceCache } from "../utils/resourceCache";

const defaultFilters = {
  search: "",
  city: "",
  specialty: "",
  minPrice: "",
  maxPrice: "",
  rating: "",
};

const BrowseGuidesPage = () => {
  const cachedPage = readResourceCache("guides:browse:default");
  const cachedAllGuides = readResourceCache("guides:options");
  const [filters, setFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const [guides, setGuides] = useState(cachedPage?.guides ?? []);
  const [allGuides, setAllGuides] = useState(cachedAllGuides ?? []);
  const [pagination, setPagination] = useState(
    cachedPage?.pagination ?? { page: 1, totalPages: 1 },
  );
  const [loading, setLoading] = useState(!cachedPage);
  const [error, setError] = useState("");
  const guidesGridRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    const loadGuides = async () => {
      try {
        if (!cachedPage) {
          setLoading(true);
        }
        const { data } = await guidesApi.getAll({
          ...appliedFilters,
          page,
          limit: 6,
        });

        if (!ignore) {
          const nextGuides = data.guides || [];
          const nextPagination = data.pagination || { page: 1, totalPages: 1 };
          setGuides(nextGuides);
          setPagination(nextPagination);
          writeResourceCache("guides:browse:default", {
            guides: nextGuides,
            pagination: nextPagination,
          });
          setError("");
        }
      } catch (requestError) {
        if (!ignore) {
          setError(getErrorMessage(requestError, "Unable to load guides."));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadGuides();

    return () => {
      ignore = true;
    };
  }, [appliedFilters, page]);

  useEffect(() => {
    let ignore = false;

    const loadGuideOptions = async () => {
      try {
        const { data } = await guidesApi.getAll({ limit: 100 });

        if (!ignore) {
          const nextAllGuides = data.guides || [];
          setAllGuides(nextAllGuides);
          writeResourceCache("guides:options", nextAllGuides);
        }
      } catch (requestError) {
        if (!ignore && !error) {
          setError(getErrorMessage(requestError, "Unable to load guides."));
        }
      }
    };

    loadGuideOptions();

    return () => {
      ignore = true;
    };
  }, []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  };

  const cityOptions = [
    ...new Set(allGuides.flatMap((guide) => guide.operatingCities || [])),
  ].sort((a, b) => a.localeCompare(b));
  const specialtyOptions = [
    ...new Set(allGuides.flatMap((guide) => guide.specialties || [])),
  ].sort((a, b) => a.localeCompare(b));
  const quickCities = cityOptions.slice(0, 8);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-[#091325] shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="grid gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:px-6">
          <div className="max-w-4xl">
            <span className="inline-flex rounded-full bg-[#75d780]/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.26em] text-[#75d780]">
              Browse Guides
            </span>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight text-white md:text-5xl">
              Search guides by city, specialty, budget, and traveler ratings
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/52">
              Find the right local expert for your trip with real filters and verified profiles.
            </p>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute right-2 top-0 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white/55 shadow-lg">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-[#75d780]" />
                <span>Matching local routes</span>
              </div>
            </div>
            <div className="absolute left-4 top-16 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white/55 shadow-lg">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-[#75d780]" />
                <span>City-first discovery</span>
              </div>
            </div>
            <div className="absolute bottom-0 right-8 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-white/55 shadow-lg">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#75d780]" />
                <span>Refined by real filters</span>
              </div>
            </div>
            <svg
              viewBox="0 0 360 180"
              className="h-[180px] w-full text-[#75d780]/60"
              fill="none"
            >
              <path
                d="M20 150C70 130 92 60 145 68C193 75 199 123 247 120C286 117 310 70 340 45"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeDasharray="8 8"
              />
              {[20, 145, 247, 340].map((x, index) => (
                <g key={x}>
                  <circle
                    cx={x}
                    cy={[150, 68, 120, 45][index]}
                    r="7"
                    fill="#75d780"
                  />
                  <circle
                    cx={x}
                    cy={[150, 68, 120, 45][index]}
                    r="16"
                    fill="#75d780"
                    fillOpacity="0.12"
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>
      <SearchFilters
        filters={filters}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onReset={handleReset}
        cityOptions={cityOptions}
        specialtyOptions={specialtyOptions}
        quickCities={quickCities}
      />
      {loading ? <LoadingSpinner label="Loading local guides..." /> : null}
      {!loading && error ? (
        <EmptyState title="Unable to load guides" description={error} />
      ) : null}
      {!loading && !error ? (
        <>
          <div className="flex flex-col gap-3 rounded-[20px] bg-[#0b1528] px-5 py-4 shadow-[0_10px_28px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/55">
              <span className="font-semibold text-white">{guides.length}</span>{" "}
              guides found
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] text-white/30">
                Sort by
              </span>
              <div className="rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-white/70">
                Newest First
              </div>
            </div>
          </div>
          <div ref={guidesGridRef} className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {guides.length ? (
              guides.map((guide) => <GuideCard key={guide._id} guide={guide} />)
            ) : (
              <div className="lg:col-span-2 xl:col-span-3">
                <EmptyState
                  title="No guides match those filters"
                  description="Try widening your city or price range to discover more local experts."
                />
              </div>
            )}
          </div>
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(newPage) => {
              setPage(newPage);
              guidesGridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </>
      ) : null}
    </div>
  );
};

export default BrowseGuidesPage;
