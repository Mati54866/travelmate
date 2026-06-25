import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await authApi.resetPassword({ token, password });
      toast.success("Password updated. Please sign in.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to reset password."));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-2xl card p-6 text-center sm:p-8">
        <h1 className="font-display text-3xl text-white sm:text-4xl">
          Reset link missing
        </h1>
        <p className="mt-3 text-white/60">
          Open the password reset link from your email to continue.
        </p>
        <Link to="/forgot-password" className="btn-primary mt-6 inline-flex">
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8 md:p-10">
        <h1 className="font-display text-4xl text-white sm:text-5xl">
          Choose a new password
        </h1>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="input-field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            minLength={6}
            required
          />
          <input
            className="input-field"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            minLength={6}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Updating..." : "Reset password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
