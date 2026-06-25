const SearchFilters = ({
  filters,
  onChange,
  onSubmit,
  onReset,
  cityOptions = [],
  specialtyOptions = [],
  quickCities = [],
  showRating = true,
}) => (
  <div className="rounded-[24px] bg-[#0a1020] border border-white/5 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.18)] sm:p-5">
    {quickCities.length ? (
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
          Popular Cities
        </p>
        <div className="flex flex-wrap gap-2">
          {quickCities.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onChange("city", city)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filters.city === city
                  ? "bg-[#75d780] text-[#071120]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {city}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/60 hover:bg-white/10"
          >
            + More
          </button>
        </div>
      </div>
    ) : null}

    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <input
          className="input-field"
          placeholder="Search by keyword"
          value={filters.search}
          onChange={(event) => onChange("search", event.target.value)}
        />

        <select
          className="input-field"
          value={filters.city}
          onChange={(event) => onChange("city", event.target.value)}
        >
          <option value="">All cities</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>

        <select
          className="input-field"
          value={filters.specialty}
          onChange={(event) => onChange("specialty", event.target.value)}
        >
          <option value="">All specialties</option>
          {specialtyOptions.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>

        <input
          className="input-field"
          placeholder="Min price"
          type="number"
          value={filters.minPrice}
          onChange={(event) => onChange("minPrice", event.target.value)}
        />
        <input
          className="input-field"
          placeholder="Max price"
          type="number"
          value={filters.maxPrice}
          onChange={(event) => onChange("maxPrice", event.target.value)}
        />
        {showRating ? (
          <select
            className="input-field"
            value={filters.rating}
            onChange={(event) => onChange("rating", event.target.value)}
          >
            <option value="">Min rating</option>
            <option value="4.5">4.5+</option>
            <option value="4">4.0+</option>
            <option value="3.5">3.5+</option>
          </select>
        ) : null}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_160px]">
        <button
          type="submit"
          className="rounded-xl bg-[#1f8a70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#227a66]"
        >
          Apply Filters
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-xl border border-[#75d780]/20 bg-[#0d1726] px-5 py-3 text-sm font-semibold text-white/70 transition-all duration-300 hover:border-[#75d780]/40 hover:bg-[#122033] hover:text-[#75d780]"
        >
          Reset
        </button>
      </div>
    </form>
  </div>
);

export default SearchFilters;
