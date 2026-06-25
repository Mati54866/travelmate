import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import LoadingSpinner from "./LoadingSpinner";

const ProtectedRoute = ({ children, roles }) => {
  const { token, user, loading, sessionCheckFailed } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner label="Checking your account..." />;
  }

  if (sessionCheckFailed && token && !user) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-[#091325] p-8 text-center text-white shadow-2xl">
        <h2 className="text-2xl font-semibold">Connection issue</h2>
        <p className="mt-3 text-white/60">
          We could not verify your session because the network is unavailable.
          Check your connection and refresh the page.
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallbackRoute =
      user.role === "guide"
        ? "/guide/dashboard"
        : user.role === "admin"
          ? "/admin/dashboard"
          : "/dashboard";
    return <Navigate to={fallbackRoute} replace />;
  }

  return children;
};

export default ProtectedRoute;
