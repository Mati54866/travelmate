import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Users,
  MapPin,
} from "lucide-react";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import StatusPill from "../../components/common/StatusPill";
import TourForm from "../../components/forms/TourForm";
import { guidesApi, toursApi, uploadApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import { formatCurrency, formatDate } from "../../utils/format";
import {
  readResourceCache,
  updateResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

const ManageToursPage = () => {
  const cachedGuideProfile = readResourceCache("guideProfile");
  const cachedTours = readResourceCache("guideTours");
  const [hasGuideProfile, setHasGuideProfile] = useState(
    cachedGuideProfile !== undefined ? Boolean(cachedGuideProfile) : true,
  );
  const [tours, setTours] = useState(cachedTours ?? []);
  const [editingTour, setEditingTour] = useState(null);
  const [loading, setLoading] = useState(
    !cachedTours && cachedGuideProfile === undefined,
  );
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    try {
      if (!cachedTours && cachedGuideProfile === undefined) {
        setLoading(true);
      }
      const [profileResponse, toursResponse] = await Promise.allSettled([
        guidesApi.getMyProfile(),
        toursApi.getMyTours(),
      ]);
      const nextHasGuideProfile = profileResponse.status === "fulfilled";
      const nextTours =
        toursResponse.status === "fulfilled"
          ? toursResponse.value.data.tours || []
          : [];
      setHasGuideProfile(nextHasGuideProfile);
      setTours(nextTours);
      writeResourceCache(
        "guideProfile",
        nextHasGuideProfile ? profileResponse.value.data.guide : null,
      );
      writeResourceCache("guideTours", nextTours);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to load your tours."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const uploadImages = async (files = []) => {
    if (!files.length) {
      return [];
    }

    const { data } = await uploadApi.uploadMultiple(files);
    return data.images || [];
  };

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      const uploads = await uploadImages(payload.files);
      const body = {
        ...payload,
        files: undefined,
        images: [...(payload.images || []), ...uploads.map((item) => item.url)],
        imagePublicIds: [
          ...(payload.imagePublicIds || []),
          ...uploads.map((item) => item.publicId),
        ],
      };

      if (editingTour?._id) {
        const { data } = await toursApi.update(editingTour._id, body);
        const nextTours = updateResourceCache("guideTours", (prev = []) =>
          prev.map((tour) => (tour._id === editingTour._id ? data.tour : tour)),
        );
        setTours(nextTours);
        toast.success("Tour updated");
      } else {
        const { data } = await toursApi.create(body);
        const nextTours = updateResourceCache("guideTours", (prev = []) => [
          data.tour,
          ...prev,
        ]);
        setTours(nextTours);
        toast.success("Tour created");
      }

      setEditingTour(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save tour."));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (tour) => {
    if (
      !confirm(
        "Are you sure you want to delete this tour? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      if (tour.imagePublicIds?.length) {
        await Promise.allSettled(
          tour.imagePublicIds.map((publicId) => uploadApi.remove(publicId)),
        );
      }
      await toursApi.remove(tour._id);
      const nextTours = updateResourceCache("guideTours", (prev = []) =>
        prev.filter((item) => item._id !== tour._id),
      );
      setTours(nextTours);
      toast.success("Tour deleted");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to delete tour."));
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading your tours..." />;
  }

  if (!hasGuideProfile) {
    return (
      <EmptyState
        title="Create your guide profile first"
        description="TravelMate needs your guide profile before you can publish tours."
      />
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.95fr,1.05fr]">
      {/* Left Column - Create/Edit Form */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#0f1625] to-[#0a1020] p-5 sm:p-6 md:p-8">
          <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
            {editingTour ? "Edit Tour" : "Create a New Tour"}
          </h1>
          <p className="mt-2 text-white/50">
            {editingTour
              ? "Update your itinerary details, pricing, and gallery images."
              : "Publish itinerary details, dates, pricing, and gallery images."}
          </p>
        </div>
        <TourForm
          initialValues={editingTour || {}}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>

      {/* Right Column - Tours List */}
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              My Tours
            </h2>
            <p className="mt-2 text-white/50">
              Manage, edit, or remove your published itineraries.
            </p>
          </div>
          {editingTour ? (
            <button
              type="button"
              onClick={() => setEditingTour(null)}
              className="btn-outline text-sm"
            >
              Cancel Edit
            </button>
          ) : null}
        </div>

        {tours.length ? (
          <div className="space-y-6">
            {tours.map((tour) => (
              <article
                key={tour._id}
                className="group rounded-xl border border-white/10 bg-dark-3 p-4 sm:p-6 transition-all duration-300 hover:border-[#75d780]/30 hover:shadow-xl hover:shadow-[#75d780]/5"
              >
                {/* Header with Title and Status */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-2xl font-bold text-white md:text-3xl group-hover:text-[#75d780] transition-colors">
                        {tour.title}
                      </h3>
                    </div>

                    {/* Price Badge - Professional styling */}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#75d780]/20 to-[#5ec06a]/10 px-4 py-1.5 border border-[#75d780]/30">
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#75d780]">
                          Price
                        </span>
                        <span className="text-xl font-bold text-white">
                          {formatCurrency(tour.pricePerPerson)}
                        </span>
                        <span className="text-xs text-white/50">
                          per person
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10">
                        <Clock className="h-3.5 w-3.5 text-white/40" />
                        <span className="text-sm text-white/70">
                          {tour.duration} hours
                        </span>
                      </div>

                      <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10">
                        <Users className="h-3.5 w-3.5 text-white/40" />
                        <span className="text-sm text-white/70">
                          Max {tour.maxGroupSize} guests
                        </span>
                      </div>

                      {tour.location && (
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5 border border-white/10">
                          <MapPin className="h-3.5 w-3.5 text-white/40" />
                          <span className="text-sm text-white/70">
                            {tour.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <StatusPill value={tour.status} />
                </div>

                {/* Description */}
                <p className="mt-4 text-white/60 leading-relaxed">
                  {tour.description}
                </p>

                {/* Available Dates */}
                {tour.availableDates?.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-white/40 flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Available Dates
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {tour.availableDates.slice(0, 4).map((date) => (
                        <span
                          key={date}
                          className="rounded-lg border border-white/10 bg-dark-4/50 px-3 py-1.5 text-sm font-medium text-white/70"
                        >
                          {formatDate(date)}
                        </span>
                      ))}
                      {tour.availableDates.length > 4 && (
                        <span className="rounded-lg border border-white/10 bg-dark-4/50 px-3 py-1.5 text-sm font-medium text-white/50">
                          +{tour.availableDates.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons - Professional styling */}
                <div className="mt-6 flex flex-wrap gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingTour(tour)}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-all duration-200 hover:bg-blue-500/20 hover:text-blue-300 border border-blue-500/30 hover:border-blue-500/50"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Tour
                  </button>

                  <Link
                    to={`/tours/${tour._id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-400 transition-all duration-200 hover:bg-purple-500/20 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50"
                  >
                    <Eye className="h-4 w-4" />
                    Preview
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(tour)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all duration-200 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 hover:border-red-500/50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-dark-3 p-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <MapPin className="h-8 w-8 text-white/30" />
            </div>
            <p className="text-lg font-medium text-white/40">No tours yet</p>
            <p className="mt-1 text-sm text-white/30">
              Create your first itinerary to start receiving bookings.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageToursPage;
