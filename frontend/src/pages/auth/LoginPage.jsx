import { useEffect, useState } from "react";
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
  const [btnWidth, setBtnWidth] = useState(() => {
    if (typeof window === "undefined") return 360;
    return Math.min(400, Math.max(220, window.innerWidth - 64));
  });

  // Role-selection modal state for new Google users
  const [pendingCredential, setPendingCredential] = useState(null);
  const [selectedRole, setSelectedRole] = useState("traveler");
  const [roleLoading, setRoleLoading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(400, Math.max(200, window.innerWidth - 64));
      setBtnWidth(w);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

      if (data.newUser) {
        // New user detected — store credential and show role-selection modal
        setPendingCredential(credentialResponse.credential);
        setLoading(false);
        return;
      }

      navigate(getDestination(data.user), {
        replace: true,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Google sign-in failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleRoleConfirm = async () => {
    try {
      setRoleLoading(true);
      const data = await loginWithGoogle({
        credential: pendingCredential,
        role: selectedRole,
      });
      toast.success("Account created! Welcome to TravelMate.");
      navigate(getDestination(data.user), { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Sign-up failed. Please try again."));
      setPendingCredential(null);
    } finally {
      setRoleLoading(false);
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
                  onError={() => toast.error("Google sign-in failed.")}
                  theme="filled_black"
                  shape="rectangular"
                  size="large"
                  text="signin_with"
                  width={btnWidth}
                />
              </div>
            </div>
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

      {/* Role-selection modal for new Google users */}
      {pendingCredential && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        >
          <div
            className="card w-full max-w-sm p-6 sm:p-8"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <h2 className="font-display text-2xl font-bold text-white">
              One more step!
            </h2>
            <p className="mt-2 text-sm text-white/60">
              You don&apos;t have an account yet. Choose your role to complete sign-up.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                id="modal-role-traveler"
                onClick={() => setSelectedRole("traveler")}
                className="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200"
                style={{
                  borderColor: selectedRole === "traveler" ? "#75d780" : "rgba(255,255,255,0.1)",
                  background: selectedRole === "traveler" ? "rgba(117,215,128,0.08)" : "rgba(255,255,255,0.03)",
                }}
              >
                <span className="text-2xl">🧳</span>
                <span className="font-semibold text-white">Traveler</span>
                <span className="text-xs text-white/50">Book tours</span>
                {selectedRole === "traveler" && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#75d780] text-xs font-bold text-black">✓</span>
                )}
              </button>

              <button
                type="button"
                id="modal-role-guide"
                onClick={() => setSelectedRole("guide")}
                className="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-200"
                style={{
                  borderColor: selectedRole === "guide" ? "#75d780" : "rgba(255,255,255,0.1)",
                  background: selectedRole === "guide" ? "rgba(117,215,128,0.08)" : "rgba(255,255,255,0.03)",
                }}
              >
                <span className="text-2xl">🗺️</span>
                <span className="font-semibold text-white">Guide</span>
                <span className="text-xs text-white/50">Offer tours</span>
                {selectedRole === "guide" && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#75d780] text-xs font-bold text-black">✓</span>
                )}
              </button>
            </div>

            <button
              id="modal-confirm-role"
              type="button"
              disabled={roleLoading}
              onClick={handleRoleConfirm}
              className="btn-primary mt-5 w-full disabled:opacity-60"
            >
              {roleLoading
                ? "Creating account..."
                : `Join as ${selectedRole === "guide" ? "Guide" : "Traveler"}`}
            </button>

            <button
              type="button"
              onClick={() => setPendingCredential(null)}
              className="mt-3 w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
