import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
import ErrorBoundary from "../components/common/ErrorBoundary";
import ProtectedRoute from "../components/common/ProtectedRoute";
import MainLayout from "./MainLayout";
import BrowseGuidesPage from "../pages/BrowseGuidesPage";
import GuideProfilePage from "../pages/GuideProfilePage";
import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import TourDetailsPage from "../pages/TourDetailsPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import EarningsPage from "../pages/guide/EarningsPage";
import GuideDashboardPage from "../pages/guide/GuideDashboardPage";
import GuideProfileSetupPage from "../pages/guide/GuideProfileSetupPage";
import ManageBookingsPage from "../pages/guide/ManageBookingsPage";
import ManageToursPage from "../pages/guide/ManageToursPage";
import GuideRecommendationsPage from "../pages/guide/GuideRecommendationsPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import BookingConfirmationPage from "../pages/traveler/BookingConfirmationPage";
import DashboardPage from "../pages/traveler/DashboardPage";
import MyReviewsPage from "../pages/traveler/MyReviewsPage";
import ProfilePage from "../pages/traveler/ProfilePage";

const App = () => (
  <ErrorBoundary>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/guides" element={<BrowseGuidesPage />} />
        <Route path="/guides/:id" element={<GuideProfilePage />} />
        <Route path="/tours/:id" element={<TourDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={["traveler"]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-confirmation/:id"
          element={
            <ProtectedRoute roles={["traveler"]}>
              <BookingConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute roles={["traveler"]}>
              <MyReviewsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute roles={["traveler", "guide"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guide/dashboard"
          element={
            <ProtectedRoute roles={["guide"]}>
              <GuideDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/tours"
          element={
            <ProtectedRoute roles={["guide"]}>
              <ManageToursPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/bookings"
          element={
            <ProtectedRoute roles={["guide"]}>
              <ManageBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/earnings"
          element={
            <ProtectedRoute roles={["guide"]}>
              <EarningsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/profile"
          element={
            <ProtectedRoute roles={["guide"]}>
              <GuideProfileSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guide/recommendations"
          element={
            <ProtectedRoute roles={["guide"]}>
              <GuideRecommendationsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
    <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
  </ErrorBoundary>
);

export default App;
