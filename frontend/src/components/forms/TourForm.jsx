import { useEffect, useState } from "react";
import { splitCsv } from "../../utils/format";

const blankForm = {
  title: "",
  description: "",
  duration: "",
  pricePerPerson: "",
  maxGroupSize: "",
  includedItems: "",
  excludedItems: "",
  meetingPoint: "",
  highlights: "",
  availableDates: "",
  status: "active",
};

const TourForm = ({ initialValues, onSubmit, loading }) => {
  const buildState = (values = {}) => ({
    ...blankForm,
    ...values,
    includedItems: values?.includedItems?.join(", ") || "",
    excludedItems: values?.excludedItems?.join(", ") || "",
    highlights: values?.highlights?.join(", ") || "",
    availableDates:
      values?.availableDates
        ?.map((date) => new Date(date).toISOString().slice(0, 10))
        .join(", ") || "",
    existingImages: values?.images || [],
    existingImagePublicIds: values?.imagePublicIds || [],
    newImages: [],
  });
  const [form, setForm] = useState(buildState(initialValues));
  const [error, setError] = useState("");
  const [dateConversionSuggestion, setDateConversionSuggestion] =
    useState(null);

  useEffect(() => {
    setForm(buildState(initialValues));
  }, [initialValues]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    // parse and validate dates (accept YYYY-MM-DD or DD-MM-YY / DD-MM-YYYY)
    const parseFlexibleDate = (str) => {
      if (!str) return null;
      const s = str.trim();
      // ISO yyyy-mm-dd
      const iso = new Date(s);
      if (!Number.isNaN(iso.getTime())) return iso;
      // dd-mm-yy or dd-mm-yyyy
      const m = s.match(/^(\d{1,2})-(\d{1,2})-(\d{2,4})$/);
      if (m) {
        const day = Number(m[1]);
        const month = Number(m[2]);
        let year = Number(m[3]);
        if (m[3].length === 2) {
          year = 2000 + year;
        }
        const d = new Date(year, month - 1, day);
        if (!Number.isNaN(d.getTime())) return d;
      }
      return null;
    };

    const parsedDates = splitCsv(form.availableDates)
      .map((date) => parseFlexibleDate(date))
      .filter((date) => !!date);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDates.some((d) => d < today)) {
      setError("Available dates cannot be in the past");
      return;
    }

    setError("");

    onSubmit({
      title: form.title,
      description: form.description,
      duration: Number(form.duration),
      pricePerPerson: Number(form.pricePerPerson),
      maxGroupSize: Number(form.maxGroupSize),
      includedItems: splitCsv(form.includedItems),
      excludedItems: splitCsv(form.excludedItems),
      meetingPoint: form.meetingPoint,
      highlights: splitCsv(form.highlights),
      availableDates: parsedDates,
      status: form.status,
      images: form.existingImages,
      imagePublicIds: form.existingImagePublicIds,
      files: Array.from(form.newImages || []),
    });
  };

  const formatDateISO = (d) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const analyzeDates = (raw) => {
    const tokens = splitCsv(raw);
    const invalid = [];
    const convertible = [];
    const converted = [];

    tokens.forEach((tok) => {
      const parsed = parseFlexibleDate(tok);
      if (!parsed) {
        invalid.push(tok);
        return;
      }
      // detect dd-mm-yy or dd-mm-yyyy formats to suggest conversion
      if (/^\d{1,2}-\d{1,2}-\d{2,4}$/.test(tok.trim())) {
        convertible.push(tok);
      }
      converted.push(formatDateISO(parsed));
    });

    return {
      invalidTokens: invalid,
      needsConversion: convertible.length > 0,
      convertedValue: converted.join(", "),
    };
  };

  const handleAvailableDatesChange = (value) => {
    handleChange("availableDates", value);
    setError("");
    setDateConversionSuggestion(null);
    if (!value) return;
    const analysis = analyzeDates(value);
    if (analysis.invalidTokens.length) {
      setError(
        `Invalid date format: ${analysis.invalidTokens.join(", ")}. Use YYYY-MM-DD or DD-MM-YYYY.`,
      );
      return;
    }
    if (analysis.needsConversion) {
      setDateConversionSuggestion(analysis.convertedValue);
    }
  };

  const handleAvailableDatesPaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData("text");
    if (!paste) return;
    // normalize separators to commas, trim
    const normalized = paste.replace(/[;\n\t|]+/g, ", ").trim();
    const analysis = analyzeDates(normalized);
    if (analysis.invalidTokens.length) {
      // allow paste to proceed but show inline error
      setError(
        `Invalid date format in pasted content: ${analysis.invalidTokens.join(", ")}`,
      );
      return; // let default paste happen so user can see raw input
    }
    // if convertible or valid, replace input with ISO list
    e.preventDefault();
    handleChange("availableDates", analysis.convertedValue);
    setDateConversionSuggestion(null);
    setError("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-6"
    >
      <input
        className="input-field"
        value={form.title}
        onChange={(event) => handleChange("title", event.target.value)}
        placeholder="Tour title"
        required
      />
      <textarea
        className="input-field min-h-32"
        value={form.description}
        onChange={(event) => handleChange("description", event.target.value)}
        placeholder="Describe the tour itinerary"
        required
      />
      <div className="grid gap-4 md:grid-cols-3">
        <input
          className="input-field"
          type="number"
          min="1"
          value={form.duration}
          onChange={(event) => handleChange("duration", event.target.value)}
          placeholder="Duration in hours"
          required
        />
        <input
          className="input-field"
          type="number"
          min="1"
          value={form.pricePerPerson}
          onChange={(event) =>
            handleChange("pricePerPerson", event.target.value)
          }
          placeholder="Price per person"
          required
        />
        <input
          className="input-field"
          type="number"
          min="1"
          max="20"
          value={form.maxGroupSize}
          onChange={(event) => handleChange("maxGroupSize", event.target.value)}
          placeholder="Max group size"
          required
        />
      </div>
      <input
        className="input-field"
        value={form.meetingPoint}
        onChange={(event) => handleChange("meetingPoint", event.target.value)}
        placeholder="Meeting point"
        required
      />
      <input
        className="input-field"
        value={form.includedItems}
        onChange={(event) => handleChange("includedItems", event.target.value)}
        placeholder="Included items, comma separated"
      />
      <input
        className="input-field"
        value={form.excludedItems}
        onChange={(event) => handleChange("excludedItems", event.target.value)}
        placeholder="Excluded items, comma separated"
      />
      <input
        className="input-field"
        value={form.highlights}
        onChange={(event) => handleChange("highlights", event.target.value)}
        placeholder="Highlights, comma separated"
      />
      <input
        className="input-field"
        value={form.availableDates}
        onChange={(event) => handleAvailableDatesChange(event.target.value)}
        onPaste={handleAvailableDatesPaste}
        placeholder="Available dates, comma separated (YYYY-MM-DD)"
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      {dateConversionSuggestion ? (
        <div className="mt-2 flex items-center gap-3">
          <p className="text-sm text-white/60">Detected non-ISO dates.</p>
          <button
            type="button"
            onClick={() => {
              handleChange("availableDates", dateConversionSuggestion);
              setDateConversionSuggestion(null);
              setError("");
            }}
            className="rounded-md bg-[#75d780] px-3 py-1 text-sm font-medium text-[#071120]"
          >
            Convert to YYYY-MM-DD
          </button>
        </div>
      ) : null}
      <select
        className="input-field"
        value={form.status}
        onChange={(event) => handleChange("status", event.target.value)}
      >
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(event) => handleChange("newImages", event.target.files)}
        className="input-field"
      />
      {form.existingImages.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {form.existingImages.map((image) => (
            <img
              key={image}
              src={image}
              alt="Tour preview"
              className="h-24 w-full rounded-2xl object-cover"
            />
          ))}
        </div>
      ) : null}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving..." : "Save tour"}
      </button>
    </form>
  );
};

export default TourForm;
