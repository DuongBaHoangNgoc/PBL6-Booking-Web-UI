import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/useAuth";
import {
  Menu,
  X,
  ChevronDown,
  User,
  LogOut,
  Map,
  CreditCard,
  LayoutDashboard,
  Heart,
  Shield,
} from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  // --- Logic đóng dropdown/mobile menu khi điều hướng ---
  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    handleNavigate("/");
  };

  // Detect Scroll để thêm hiệu ứng bóng đổ
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function onDoc(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  // Class hỗ trợ Active Link (Updated for Brighter Ocean Theme)
  const getLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white/20 text-white shadow-sm backdrop-blur-sm" // Active: Nền trắng mờ
        : "text-blue-50 hover:text-white hover:bg-white/10" // Inactive: Text trắng ngà, hover trắng tinh
    }`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-cyan-500/20"
          : "bg-gradient-to-r from-blue-600/95 to-cyan-500/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
            ✈
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight text-white">
            BOOKING
          </span>
        </Link>

        {/* =========================================
          MENU GIỮA (DESKTOP)
        ========================================= */}
        <div className="hidden md:flex items-center gap-2">
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>
          <Link to="/tours" className={getLinkClass("/tours")}>
            Tours
          </Link>

          {/* === CHỈ USER THẤY === */}
          {user && user.role === "user" && (
            <Link to="/bookings" className={getLinkClass("/bookings")}>
              My Trips
            </Link>
          )}

          {/* === CHỈ SUPPLIER THẤY === */}
          {user && user.role === "supplier" && (
            <Link to="/supplier" className={getLinkClass("/supplier")}>
              Supplier Panel
            </Link>
          )}

          {/* === CHỈ ADMIN THẤY === */}
          {user && user.role === "admin" && (
            <>
              {/* Quản lý Users */}
              <Link to="/admin/users" className={getLinkClass("/admin/users")}>
                Users Management
              </Link>

              {/* Quản lý Tours */}
              <Link to="/admin/tours" className={getLinkClass("/admin/tours")}>
                Tours Management
              </Link>

              {/* Quản lý Bookings */}
              <Link
                to="/admin/bookings"
                className={getLinkClass("/admin/bookings")}
              >
                Bookings Management
              </Link>

              {/* Quản lý Coupons */}
              <Link
                to="/admin/coupons"
                className={getLinkClass("/admin/coupons")}
              >
                Coupons Management
              </Link>

              {/* Quản lý Payments */}
              <Link
                to="/admin/payments"
                className={getLinkClass("/admin/payments")}
              >
                Payments Management
              </Link>
            </>
          )}
        </div>

        {/* =========================================
          RIGHT SIDE ACTIONS
        ========================================= */}
        <div className="flex items-center gap-4" ref={navRef}>
          {/* --- TRẠNG THÁI GUEST --- */}
          {!user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/auth/login"
                className="text-blue-50 font-medium hover:text-white transition px-4 py-2"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-white text-blue-600 px-5 py-2.5 rounded-full font-bold hover:bg-blue-50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            /* --- TRẠNG THÁI USER/ADMIN --- */
            <div className="relative">
              <button
                onClick={() => setOpen((s) => !s)}
                className="flex items-center gap-2 focus:outline-none p-1 pr-3 rounded-full border border-white/20 hover:bg-white/10 transition-all bg-white/10 text-white"
              >
                <div className="w-9 h-9 rounded-full bg-cyan-500 overflow-hidden border-2 border-white/20">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-blue-400 to-cyan-400">
                      {user.fullName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <span className="hidden md:block font-medium text-sm max-w-[100px] truncate">
                  {user.fullName?.split(" ")[0]}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-blue-100 transition-transform duration-200 ${
                    open ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown menu (Giữ nền trắng) */}
              {open && (
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  {/* Header Dropdown */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user.email}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-700">
                      {user.role}
                    </div>
                  </div>

                  <div className="p-2">
                    {/* Admin Links */}
                    {user.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => handleNavigate("/admin")}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition"
                      >
                        <Shield className="w-4 h-4 text-slate-400" /> Admin
                        Dashboard
                      </Link>
                    )}

                    {/* Supplier Links */}
                    {user.role === "supplier" && (
                      <Link
                        to="/supplier"
                        onClick={() => handleNavigate("/supplier")}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />{" "}
                        Supplier Dashboard
                      </Link>
                    )}

                    {/* Common Links */}
                    <Link
                      to="/profile"
                      onClick={() => handleNavigate("/profile")}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </Link>

                    {user.role === "user" && (
                      <Link
                        to="/bookings"
                        onClick={() => handleNavigate("/bookings")}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition"
                      >
                        <Heart className="w-4 h-4 text-slate-400" /> My Bookings
                      </Link>
                    )}

                    <Link
                      to="/payments"
                      onClick={() => handleNavigate("/payments")}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 text-slate-700 text-sm transition"
                    >
                      <CreditCard className="w-4 h-4 text-slate-400" /> Payments
                    </Link>

                    <div className="h-px bg-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-sm transition text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white hover:bg-white/20 rounded-lg transition"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* =========================================
        MOBILE MENU
      ========================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full left-0 top-20 animate-in slide-in-from-top-5">
          <div className="p-4 space-y-2">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
            >
              Home
            </Link>
            <Link
              to="/tours"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
            >
              Tours
            </Link>

            {user && (
              <>
                <div className="h-px bg-slate-100 my-2"></div>
                <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Account
                </div>

                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Profile
                </Link>

                {user.role === "admin" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-medium"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-50 text-rose-600 font-medium"
                >
                  Log Out
                </button>
              </>
            )}

            {!user && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Link
                  to="/auth/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 rounded-xl border border-slate-200 text-slate-700 font-medium"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-3 rounded-xl bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
