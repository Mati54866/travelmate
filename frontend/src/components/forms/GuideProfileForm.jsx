import { useEffect, useState } from "react";
import { splitCsv } from "../../utils/format";

const defaultValues = {
  bio: "",
  gender: "male",
  languages: "",
  specialties: "",
  hourlyRate: "",
  operatingCities: "",
  yearsOfExperience: "",
  isAvailable: true
};

const GuideProfileForm = ({ initialValues, onSubmit, loading }) => {
  const buildState = (values = {}) => ({
    ...defaultValues,
    ...values,
    gender: values?.userId?.gender || values?.gender || "male",
    languages: values?.languages?.join(", ") || "",
    specialties: values?.specialties?.join(", ") || "",
    operatingCities: values?.operatingCities?.join(", ") || ""
  });
  const [form, setForm] = useState(buildState(initialValues));

  useEffect(() => {
    setForm(buildState(initialValues));
  }, [initialValues]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({
      bio: form.bio,
      gender: form.gender,
      languages: splitCsv(form.languages),
      specialties: splitCsv(form.specialties),
      hourlyRate: Number(form.hourlyRate),
      operatingCities: splitCsv(form.operatingCities),
      yearsOfExperience: Number(form.yearsOfExperience || 0),
      isAvailable: form.isAvailable
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-6">
      <textarea
        className="input-field min-h-32"
        value={form.bio}
        onChange={(event) => handleChange("bio", event.target.value)}
        placeholder="Tell travelers about your guiding style"
        required
      />
      <select
        className="input-field"
        value={form.gender}
        onChange={(event) => handleChange("gender", event.target.value)}
      >
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
      <input
        className="input-field"
        value={form.languages}
        onChange={(event) => handleChange("languages", event.target.value)}
        placeholder="Languages, comma separated"
        required
      />
      <input
        className="input-field"
        value={form.specialties}
        onChange={(event) => handleChange("specialties", event.target.value)}
        placeholder="Specialties, comma separated"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <input
          className="input-field"
          type="number"
          min="5"
          max="500"
          value={form.hourlyRate}
          onChange={(event) => handleChange("hourlyRate", event.target.value)}
          placeholder="Hourly rate"
          required
        />
        <input
          className="input-field"
          type="number"
          min="0"
          value={form.yearsOfExperience}
          onChange={(event) => handleChange("yearsOfExperience", event.target.value)}
          placeholder="Years of experience"
        />
      </div>
      <input
        className="input-field"
        value={form.operatingCities}
        onChange={(event) => handleChange("operatingCities", event.target.value)}
        placeholder="Operating cities, comma separated"
        required
      />
      <label className="flex items-center gap-3 text-sm text-white/70">
        <input
          type="checkbox"
          checked={form.isAvailable}
          onChange={(event) => handleChange("isAvailable", event.target.checked)}
        />
        Available for new bookings
      </label>
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? "Saving..." : "Save guide profile"}
      </button>
    </form>
  );
};

export default GuideProfileForm;
