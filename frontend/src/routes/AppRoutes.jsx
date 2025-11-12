import { Routes, Route, Navigate } from "react-router-dom";

// Layouts
import { ClientLayout } from "@/components/layout/ClientLayout";

// Guards
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import TourSearchResult from "@/components/pages/tours/ToursList";
import TourDetail from "@/components/pages/tours/TourDetail";
import PaymentsPage from "@/components/pages/payments/PaymentsPage";

import { Profile } from "../pages/client/Profile";
import BookingsPage from "@/components/pages/bookings/MyBookings";
import BookingDetailPage from "@/components/pages/bookings/BookingPageDetail";
import AdminBookingPage from "@/pages/admin/AdminBookingPage";
import HashtagResultPage from "@/components/pages/tours/HashtagResultPage";
import { TourDashboard } from "@/components/TourDashBoard";
import { ManageUsersPage } from "@/components/pages/users/ManageUsersPage";
import { ManageToursPage } from "@/components/pages/tours/ManageToursPage";
import { ManageTourDetailPage } from "@/components/pages/tours/ManageTourDetailPage";
export const AppRoutes = () => {
  return (
    <Routes>
      {/* =========================================
        AREA 1: CLIENT ROUTES
        =========================================
      */}
      <Route element={<ClientLayout />}>
        {/* --- 1.1: Public Pages --- */}
        <Route path="/" element={<Home />} />
        <Route path="/tours" element={<TourSearchResult />} />
        <Route path="/tours/:id/:slug/" element={<TourDetail />} />

        <Route path="/hashtags/:hashtagName" element={<HashtagResultPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        {/* --- 1.2: Authenticating Pages --- */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/bookings/:bookingId" element={<BookingDetailPage />} />

        {/* --- 1.3: Protected Pages (User & Admin) --- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* =========================================
        AREA 2: ADMIN ROUTES
        =========================================
      */}
      <Route element={<AdminRoute />}>
        <Route element={<ClientLayout />}>
          <Route path="/admin" element={<TourDashboard />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/tours" element={<ManageToursPage />} />
          <Route path="admin/bookings" element={<AdminBookingPage />} />
          <Route
            path="/admin/tours/edit/:id"
            element={<ManageTourDetailPage />}
          />
        </Route>
      </Route>
    </Routes>
  );
};
