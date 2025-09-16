import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar"; // dùng lại Navbar cũ
import {
  FaHome,
  FaWallet,
  FaBook,
  FaBriefcase,
  FaGlobe,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export default function DashboardLayout({ user, setUser }) {
  const [expanded, setExpanded] = useState(false);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background chia 2 */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, #0d47a1 40%, #f9fafb 40%)`,
        }}
      >
        <img
          src="/backgrounds/login-bg.png"
          alt="plane"
          className="w-full h-[40%] object-cover"
        />
      </div>

      {/* Navbar*/}
      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        {/* Sidebar nổi bên trái */}
        <aside
          className={`bg-blue-600 text-white flex flex-col transition-all duration-300 ${
            expanded ? "w-64" : "w-16"
          }`}
        >
          {/* Nút toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-4 text-lg focus:outline-none"
          >
            ☰
          </button>

          <nav className="flex-1 space-y-4 mt-6">
            <Link
              to="/"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaHome />
              {expanded && <span>Home</span>}
            </Link>
            <Link
              to="/wallet"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaWallet />
              {expanded && <span>Wallet</span>}
            </Link>
            <Link
              to="/booking"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaBook />
              {expanded && <span>Booking</span>}
            </Link>
            <Link
              to="/business"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaBriefcase />
              {expanded && <span>Business</span>}
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaGlobe />
              {expanded && <span>Explore</span>}
            </Link>
            <Link
              to="/support"
              className="flex items-center gap-3 px-4 hover:bg-blue-700 rounded py-2"
            >
              <FaQuestionCircle />
              {expanded && <span>Support</span>}
            </Link>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Search Flight */}
          <section className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Search Flight</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                placeholder="From"
                className="border rounded p-2"
              />
              <input
                type="text"
                placeholder="To"
                className="border rounded p-2"
              />
              <input type="date" className="border rounded p-2" />
              <input type="date" className="border rounded p-2" />
              <button className="bg-red-500 text-white rounded p-2">
                Search
              </button>
            </div>
          </section>

          {/* Special Offer */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Special Offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow rounded-lg p-4">
                <p className="font-semibold">Up to $100 Discount</p>
                <p className="text-sm text-gray-500">Code: SAVE100</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <p className="font-semibold">Up to $50 Discount</p>
                <p className="text-sm text-gray-500">Code: SAVE50</p>
              </div>
            </div>
          </section>

          {/* Best Offer */}
          <section>
            <h3 className="text-lg font-semibold mb-2">Best Offer</h3>
            <div className="bg-white shadow rounded-lg divide-y">
              {[
                {
                  route: "Delhi → Toronto",
                  price: "$546",
                  date: "15 Aug - 22 Aug",
                },
                {
                  route: "Chennai → Mumbai",
                  price: "$345",
                  date: "15 Aug - 22 Aug",
                },
                {
                  route: "Mumbai → Bangalore",
                  price: "$198",
                  date: "15 Aug - 22 Aug",
                },
              ].map((offer, i) => (
                <div key={i} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{offer.route}</p>
                    <p className="text-sm text-gray-500">{offer.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-bold">{offer.price}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
