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
import TourDetailTest from "@/components/pages/tours/TourDetailTest";
import { Profile } from "../pages/client/Profile";
import { BookingsPage } from "@/components/pages/bookings/MyBookings";
import { TourDashboard } from "@/components/TourDashBoard";
import { ManageUsersPage } from "@/components/pages/users/ManageUsersPage";

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
        <Route path="/tours/:slug/:id" element={<TourDetail />} />

        <Route path="/tour-test/:slug/:id" element={<TourDetailTest />} />

        {/* --- 1.2: Authenticating Pages --- */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/bookings" element={<BookingsPage />} />

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
        </Route>
      </Route>
    </Routes>
  );
};
