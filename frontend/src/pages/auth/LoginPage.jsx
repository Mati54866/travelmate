import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../../hooks/useAuth";
import { getErrorMessage } from "../../utils/api";

const LoginPage = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const getRoleHome = (user) => {
    if (user.role === "guide") return "/guide/dashboard";
    if (user.role === "admin") return "/admin/dashboard";
    return "/dashboard";
  };

  const getDestination = (user) => {
    const requestedPath = location.state?.from?.pathname;
    const roleHome = getRoleHome(user);

    if (!requestedPath) return roleHome;
    if (requestedPath.startsWith("/guide") && user.role !== "guide") return roleHome;
    if (requestedPath.startsWith("/admin") && user.role !== "admin") return roleHome;
    if (
      ["/dashboard", "/booking-confirmation", "/reviews"].some((path) =>
        requestedPath.startsWith(path)
      ) &&
      user.role !== "traveler"
    ) {
      return roleHome;
    }

    return requestedPath;
  };

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const data = await login(form);
      navigate(getDestination(data.user), {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to sign in."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await loginWithGoogle({
        credential: credentialResponse.credential,
      });
      navigate(getDestination(data.user), {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8 md:p-10">
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Sign in</h1>
        <p className="mt-3 text-white/60">
          Access bookings, tours, and your TravelMate profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
            {loading ? "Signing in..." : "Sign in with email"}
          </button>
        </form>

        {googleEnabled ? (
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-in failed.")}
            />
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-white/50">
            Google sign-in is unavailable. Please use email and password to continue.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/forgot-password"
            className="font-semibold text-[#75d780] hover:text-[#8ae994]"
          >
            Forgot password?
          </Link>
          <Link
            to="/register"
            className="font-semibold text-white/70 hover:text-white"
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
