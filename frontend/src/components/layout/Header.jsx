import { Link, useNavigate } from "react-router-dom"
import { useState, useRef, useEffect } from "react"
import { useAuth } from "@/context/useAuth"
import { Menu, X, ChevronDown } from "lucide-react"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navRef = useRef()
  const navigate = useNavigate()

  const { user, logout } = useAuth()

  // --- Logic đóng dropdown/mobile menu khi điều hướng ---
  const handleNavigate = (path) => {
    navigate(path)
    setMobileMenuOpen(false)
    setOpen(false)
  }

  const handleLogout = () => {
    logout()
    handleNavigate("/")
  }

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function onDoc(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("click", onDoc)
    return () => document.removeEventListener("click", onDoc)
  }, [])

  return (
    <nav className="fixed top-0 left-0 w-full bg-gradient-to-r from-green-600 to-green-700 text-white z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6 py-4">
        {/* =========================================
          MENU GIỮA (DESKTOP) - ĐÃ PHÂN QUYỀN
        ========================================= */}
        <div className="hidden md:flex items-center gap-8">
          {user === null && (
            <>
              <Link to="/" className="hover:text-green-100 transition font-medium">
                Home
              </Link>
              <Link to="/tours" className="hover:text-green-100 transition font-medium">
                Tours
              </Link>
            </>
          )}
          
          {/* === CHỈ USER & ADMIN THẤY === */}
          {user && user.role === "user" && (
            <>
              <Link to="/tours" className="hover:text-green-100 transition font-medium">
                Tours
              </Link>
              <Link to="/bookings" className="hover:text-green-100 transition font-medium">
                My Bookings
              </Link>
            </>
          )}
          {/* === CHỈ SUPPLIER THẤY === */}
          {user && user.role === 'supplier' && (
            <>
              <Link to="/supplier" className="hover:text-green-100 transition font-medium">
                Dashboard
              </Link>
              <Link to="/supplier/tours" className="hover:text-green-100 transition font-medium">
                Tour Management
              </Link>
            </>
          )}

          {/* === CHỈ ADMIN THẤY === */}
          {user && user.role === 'admin' && (
            <>
              <Link to="/admin" className="hover:text-green-100 transition font-medium">
                Dashboard
              </Link>
              <Link to="/admin/users" className="hover:text-green-100 transition font-medium">
                User Management
              </Link>
              <Link to="/admin/tours" className="hover:text-green-100 transition font-medium">
                Tour Management
              </Link>
            </>
          )}
        </div>

        {/* Logo */}
        <Link to="/" className="text-xl md:text-2xl font-bold tracking-wider hover:text-green-100 transition">
          ✈ BOOKING
        </Link>

        {/* =========================================
          PHẦN LOGIN / USER MENU (DESKTOP)
        ========================================= */}
        <div className="flex items-center gap-4" ref={navRef}>
          {/* --- TRẠNG THÁI GUEST --- */}
          {!user ? (
            <>
              <Link to="/auth/login" className="hidden md:inline-block hover:text-green-100 transition font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                className="hidden md:inline-block border-2 border-white px-4 py-2 rounded-lg hover:bg-white hover:text-green-600 transition font-semibold"
              >
                Sign Up
              </Link>
            </>
          ) : (
            /* --- TRẠNG THÁI USER/ADMIN --- */
            <div className="relative">
              {/* Avatar + Username */}
              <button
                onClick={() => setOpen((s) => !s)}
                className="flex items-center gap-2 focus:outline-none hover:bg-green-500 px-3 py-2 rounded-lg transition"
                aria-label="Open user menu"
              >
                <div className="w-10 h-10 rounded-full bg-green-300 flex items-center justify-center text-white font-bold overflow-hidden border-2 border-white">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <span className="hidden md:inline font-semibold">{user.fullName || "User"}</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-neutral-800 rounded-xl shadow-xl overflow-hidden border border-amber-100 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 flex items-center gap-3 border-b border-amber-100 bg-amber-50">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold overflow-hidden">
                      {user.avatar ? (
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.fullName?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-neutral-900">{user.fullName || "User"}</div>
                      <div className="text-xs text-green-600 font-medium">Online</div>
                    </div>
                  </div>

                  <div className="py-2">
                    {/* Link Admin (trong dropdown) */}
                    {user.role === 'admin' && (
                       <Link
                        to="/admin"
                        onClick={() => handleNavigate('/admin')}
                        className="block px-4 py-2 hover:bg-green-50 transition text-neutral-700 font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => handleNavigate('/profile')}
                      className="block px-4 py-2 hover:bg-green-50 transition text-neutral-700 font-medium"
                    >
                      Profile
                    </Link>
                    {/* Đã chuyển "My Bookings" lên menu chính */}
                    <Link
                      to="/payments" // Giả sử bạn có trang này
                      onClick={() => handleNavigate('/payments')}
                      className="block px-4 py-2 hover:bg-green-50 transition text-neutral-700 font-medium"
                    >
                      Payments
                    </Link>
                    
                    <div className="border-t border-amber-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-green-500 rounded-lg transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* =========================================
        MOBILE MENU - ĐÃ PHÂN QUYỀN
      ========================================= */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-green-700 border-t border-green-600 py-4 px-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-100 transition font-medium">
            Home
          </Link>
          <Link to="/tours" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-100 transition font-medium">
            Tours
          </Link>

          {/* === CHỈ USER & ADMIN THẤY (MOBILE) === */}
          {user && (
            <Link to="/my-bookings" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-100 transition font-medium">
              My Bookings
            </Link>
          )}

          {/* === CHỈ ADMIN THẤY (MOBILE) === */}
          {user && user.role === 'admin' && (
            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-100 transition font-medium bg-green-500 rounded-md">
              Manage
            </Link>
          )}

          {/* === CHỈ GUEST THẤY (MOBILE) === */}
          {!user && (
            <>
              <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 hover:text-green-100 transition font-medium">
                Login
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 border border-white px-3 rounded hover:bg-white hover:text-green-600 transition font-medium"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}


