import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserCircle, Shield, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import EmptyState from "../../components/common/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import GuideProfileForm from "../../components/forms/GuideProfileForm";
import { guidesApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";
import {
  readResourceCache,
  writeResourceCache,
} from "../../utils/resourceCache";

const GuideProfileSetupPage = () => {
  const navigate = useNavigate();
  const cachedGuide = readResourceCache("guideProfile");
  const [guide, setGuide] = useState(cachedGuide ?? null);
  const [loading, setLoading] = useState(cachedGuide === undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadGuide = async () => {
      try {
        if (cachedGuide === undefined) {
          setLoading(true);
        }
        const { data } = await guidesApi.getMyProfile();
        if (!ignore) {
          setGuide(data.guide);
          writeResourceCache("guideProfile", data.guide);
        }
      } catch (error) {
        if (!ignore && error?.response?.status !== 404) {
          toast.error(getErrorMessage(error, "Unable to load guide profile."));
        }
        if (!ignore && error?.response?.status === 404) {
          writeResourceCache("guideProfile", null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadGuide();

    return () => {
      ignore = true;
    };
  }, []);

  const handleSubmit = async (payload) => {
    try {
      setSaving(true);
      const { data } = guide
        ? await guidesApi.updateProfile(payload)
        : await guidesApi.createProfile(payload);
      setGuide(data.guide);
      writeResourceCache("guideProfile", data.guide);
      toast.success(guide ? "Guide profile updated" : "Guide profile created");
      setTimeout(() => {
        navigate("/guide/dashboard");
      }, 1500);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to save guide profile."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading guide profile..." />;
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[0.9fr,1.1fr]">
      {/* Left Column - Info */}
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-[#75d780] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </button>

        {/* Header */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#75d780]/10">
              <UserCircle className="h-6 w-6 text-[#75d780]" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-white md:text-4xl">
                {guide ? "Edit Profile" : "Guide Profile Setup"}
              </h1>
              <p className="text-sm text-white/50">
                {guide
                  ? "Update your public guide information"
                  : "Create your public guide profile"}
              </p>
            </div>
          </div>
          <p className="text-white/60 leading-relaxed">
            Add your bio, languages, specialties, price, and operating cities so
            travelers can discover you.
          </p>
        </div>

        {/* Info Cards */}
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-dark-3/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#75d780]/10">
                <Shield className="h-4 w-4 text-[#75d780]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  {guide
                    ? "Profile Ready to Refine"
                    : "Create Your Public Profile"}
                </p>
                <p className="text-xs text-white/40">
                  TravelMate uses this page to power search filters, ratings,
                  and the guide detail page.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-dark-3/50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/10">
                <Sparkles className="h-4 w-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Pro Tip</p>
                <p className="text-xs text-white/40">
                  Complete your profile to appear in search results and start
                  receiving bookings.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Note */}
        <div className="rounded-xl border border-[#75d780]/20 bg-[#75d780]/5 p-4">
          <p className="text-xs text-[#75d780]">
            ✨ Your profile will be visible to travelers once you save your
            information.
          </p>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f1625] to-[#0a1020] p-5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] sm:p-6">
        <GuideProfileForm
          initialValues={guide || {}}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </div>
  );
};

export default GuideProfileSetupPage;
