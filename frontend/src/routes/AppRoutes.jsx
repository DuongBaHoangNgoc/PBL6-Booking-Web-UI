import { Routes, Route, Navigate } from "react-router-dom";
// Layouts
import { ClientLayout } from "@/components/layout/ClientLayout";
// Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import SignUpPage from "@/pages/SignupPage";
import TourSearchResult from "@/components/pages/tours/TourSearchResult";
import TourDetail from "@/components/pages/tours/TourDetail";
import PaymentsPage from "@/components/pages/payments/PaymentsPage";
import { Profile } from "../pages/Profile";
import BookingsPage from "@/components/pages/bookings/MyBookings";
import BookingDetailPage from "@/components/pages/bookings/BookingPageDetail";
import AdminBookingPage from "@/pages/AdminBookingPage";
import HashtagResultPage from "@/components/pages/tours/HashtagResultPage";
import { AdminDashboard } from "@/components/pages/dashboard/AdminDashBoard";
import { ManageUsersPage } from "@/components/pages/users/ManageUsersPage";
import { ManageToursPage } from "@/components/pages/tours/ManageToursPage";
import { ManageTourDetailPage } from "@/components/pages/tours/ManageTourDetailPage";
import { SupplierDashboard } from "@/components/pages/dashboard/SupplierDashBoard";
import { SupplierLayout } from "@/components/layout/SupplierLayout";
import { SupplierRoute } from "./SupplierRoute";
import ManageBookingsPage from "@/pages/SupplierBookingsPage";
import CalendarPage from "@/pages/CalendarPage";
import SupplierPaymentsPage from "@/components/pages/payments/SupplierPaymentsPage";
import { EarningsPage } from "@/pages/EarningsPage";
import { ManageTourReviewsPage } from "@/components/pages/reviews/ManageTourReviewsPage";
import { useAuth } from "@/context/useAuth";
import { ManageCouponsPage } from "@/components/pages/coupons/ManageCouponsPage";
import ForgotPassword from "@/pages/ForgotPassword";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { ManageWithdrawRequestsPage } from "@/components/pages/payments/ManageWithdrawRequestsPage";

const RootRedirector = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    // 3. LOGIC ĐIỀU HƯỚNG DỰA TRÊN VAI TRÒ
    if (user.role === "admin") {
      return <Navigate to="/admin" replace />;
    }
    if (user.role === "supplier") {
      // Supplier
      return <Navigate to="/supplier/dashboard" replace />;
    }
  }

  return <Home />;
};

export const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      {/* =========================================
        AREA 1: CLIENT ROUTES
        =========================================
      */}
      <Route path="/" element={<ClientLayout />}>
        {/* --- 1.1: Public Pages --- */}
        <Route index element={<RootRedirector />} />

        <Route path="tours" element={<TourSearchResult />} />
        <Route path="tours/:id/:slug/" element={<TourDetail />} />
        <Route path="hashtags/:hashtagName" element={<HashtagResultPage />} />
        <Route path="payments" element={<PaymentsPage />} />

        {/* --- 1.2: Authenticating Pages --- */}
        <Route path="signup" element={<SignUpPage />} />
        <Route path="auth/login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />

        {/* --- 1.3: Protected Pages (User & Admin) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="bookings/:bookingId" element={<BookingDetailPage />} />
        </Route>
      </Route>

      {/* =========================================
        AREA 2: ADMIN ROUTES
        =========================================
      */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="tours" element={<ManageToursPage />} />
          <Route path="bookings" element={<AdminBookingPage />} />
          <Route path="tours/edit/:id" element={<ManageTourDetailPage />} />
          <Route path="revenue" element={<EarningsPage />} />
          <Route path="coupons" element={<ManageCouponsPage />} />
          <Route path="payments" element={<ManageWithdrawRequestsPage />} />
        </Route>
      </Route>

      {/* =========================================
        AREA 3: SUPPLIER ROUTES
        ===========================================
      */}
      <Route path="/supplier" element={<SupplierRoute />}>
        <Route element={<SupplierLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SupplierDashboard />} />
          <Route path="tours" element={<ManageToursPage />} />
          <Route path="tours/edit/:id" element={<ManageTourDetailPage />} />
          <Route path="profile" element={<Profile />} />
          <Route path="bookings" element={<ManageBookingsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="revenue" element={<EarningsPage />} />
          <Route path="payments" element={<SupplierPaymentsPage />} />
          <Route path="reviews" element={<ManageTourReviewsPage />} />
          <Route path="coupons" element={<ManageCouponsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};
