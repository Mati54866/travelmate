import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../../api/services";
import { getErrorMessage } from "../../utils/api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewToken, setPreviewToken] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const { data } = await authApi.forgotPassword({ email });
      setPreviewToken(data.resetTokenPreview || "");
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to send reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card p-6 sm:p-8 md:p-10">
        <h1 className="font-display text-4xl text-white sm:text-5xl">
          Reset your password
        </h1>
        <p className="mt-3 text-white/60">
          We&apos;ll send a secure reset link to the email on your TravelMate account.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            className="input-field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        {previewToken ? (
          <div className="mt-6 rounded-[28px] bg-white/[0.04] p-5">
            <p className="text-sm font-semibold text-white">
              Password Reset Link
            </p>
            <p className="mt-2 break-all text-sm text-white/60">
              {previewToken}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
