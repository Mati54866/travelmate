import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
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
  const googleEnabled = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

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
          Select your account type to get started — you can update your profile after signing up.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
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
          <input
            className="input-field"
            type="password"
            value={form.password}
            onChange={(event) => handleChange("password", event.target.value)}
            placeholder="Password"
            minLength={6}
            required
          />
          <select
            className="input-field"
            value={form.role}
            onChange={(event) => handleChange("role", event.target.value)}
          >
            <option value="traveler">Traveler</option>
            <option value="guide">Guide</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Register with email"}
          </button>
        </form>

        {googleEnabled ? (
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google sign-up failed.")}
            />
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
