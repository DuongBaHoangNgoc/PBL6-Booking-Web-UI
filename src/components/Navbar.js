import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

export default function Navbar({ user, setUser }) {
  const [open, setOpen] = useState(false);
  const navRef = useRef();
  const navigate = useNavigate();

  // close dropdown khi click ngoài
  useEffect(() => {
    function onDoc(e) {
      if (navRef.current && !navRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate("/"); // về home
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-800 text-white z-50">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <Link to="/" className="text-lg font-bold">
            BOOKING
          </Link>
        </div>

        {/* Menu giữa */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="hover:text-green-300">
            Home
          </Link>
          <Link to="/about" className="hover:text-green-300">
            About
          </Link>
          <Link to="/tours" className="hover:text-green-300">
            Tours
          </Link>
        </div>

        {/* Phần login / user menu */}
        <div className="flex items-center gap-4" ref={navRef}>
          {!user ? (
            <>
              <Link
                to="/login"
                className="hidden md:inline-block hover:text-green-300"
              >
                Login
              </Link>
              <button className="hidden md:inline-block border px-3 py-1 rounded hover:bg-white hover:text-gray-800">
                Sign Up
              </button>
            </>
          ) : (
            <div className="relative">
              {/* Avatar + Username */}
              <button
                onClick={() => setOpen((s) => !s)}
                className="flex items-center gap-2 focus:outline-none"
                aria-label="Open user menu"
              >
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name?.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <span className="hidden md:inline font-medium">
                  {user.name}
                </span>
              </button>

              {/* Dropdown menu */}
              {open && (
                <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-4 flex items-center gap-3 border-b">
                    <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-green-500">Online</div>
                    </div>
                  </div>

                  <div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/bookings"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      My Bookings
                    </Link>
                    <Link
                      to="/payments"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Payments
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <Link
                      to="/support"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Support
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
