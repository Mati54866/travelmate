import { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/api";

const RegisterPage = () => {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "traveler",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
  const [btnWidth, setBtnWidth] = useState(() => {
    if (typeof window === "undefined") return 360;
    return Math.min(400, Math.max(220, window.innerWidth - 64));
  });

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(400, Math.max(200, window.innerWidth - 64));
      setBtnWidth(w);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const data = await register(form);
      navigate(data.user.role === "guide" ? "/guide/profile" : "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to create account."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await loginWithGoogle({
        credential: credentialResponse.credential,
        role: form.role,
      });
      navigate(data.user.role === "guide" ? "/guide/profile" : "/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-up failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8 md:p-10">
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          Create your TravelMate account
        </h1>
        <p className="mt-3 text-white/60">
          First, choose your account type — this applies to both sign-up methods below.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            id="role-traveler"
            onClick={() => handleChange("role", "traveler")}
            className="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200"
            style={{
              borderColor: form.role === "traveler" ? "#75d780" : "rgba(255,255,255,0.1)",
              background: form.role === "traveler" ? "rgba(117,215,128,0.08)" : "rgba(255,255,255,0.03)",
            }}
          >
            <span className="text-2xl">🧳</span>
            <span className="font-semibold text-white">Traveler</span>
            <span className="text-xs text-white/50">Discover guides & book tours</span>
            {form.role === "traveler" && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#75d780] text-xs font-bold text-black">✓</span>
            )}
          </button>

          <button
            type="button"
            id="role-guide"
            onClick={() => handleChange("role", "guide")}
            className="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200"
            style={{
              borderColor: form.role === "guide" ? "#75d780" : "rgba(255,255,255,0.1)",
              background: form.role === "guide" ? "rgba(117,215,128,0.08)" : "rgba(255,255,255,0.03)",
            }}
          >
            <span className="text-2xl">🗺️</span>
            <span className="font-semibold text-white">Guide</span>
            <span className="text-xs text-white/50">Offer tours & earn income</span>
            {form.role === "guide" && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#75d780] text-xs font-bold text-black">✓</span>
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            className="input-field"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="Full name"
            required
          />
          <input
            className="input-field"
            type="email"
            value={form.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="Email address"
            required
          />
          <div className="relative">
            <input
              className="input-field pr-10"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="Password"
              minLength={6}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading
              ? "Creating account..."
              : `Register as ${form.role === "guide" ? "Guide" : "Traveler"} with email`}
          </button>
        </form>

        {googleEnabled ? (
          <div className="mt-6 space-y-4">
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                or continue with
              </span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex w-full justify-center overflow-hidden">
              <div className="flex w-full max-w-[400px] justify-center transition-transform hover:scale-[1.01]">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google sign-up failed.")}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signup_with"
                  width={btnWidth}
                />
              </div>
            </div>
            <p className="text-center text-xs text-white/40">
              Will register you as a{" "}
              <span className="font-semibold text-[#75d780]">
                {form.role === "guide" ? "Guide" : "Traveler"}
              </span>
            </p>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-white/50">
            Google sign-in is unavailable. Please use email and password to continue.
          </p>
        )}

        <p className="mt-6 text-sm text-white/60">
          Already registered?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#75d780] hover:text-[#8ae994]"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
