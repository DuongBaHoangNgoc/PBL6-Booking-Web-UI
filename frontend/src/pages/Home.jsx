import { useNavigate } from "react-router-dom";
import FeaturedDestinations from "../components/FeaturedDestinations";
import TourSearchBar from "../components/TourSearchBar";
import { useState } from "react";

export default function Home({ user }) {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("Hồ Chí Minh");
  const [date, setDate] = useState(null);

  const handleGetStarted = () => {
    navigate(user ? "/tour" : "/login");
  };
  
  const formatDate = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Điều hướng sang trang tìm kiếm tour
  const handleSearch = () => {
    if (!destination.trim()) return;

    const params = new URLSearchParams({
      keyword: destination,
      departure,
      from: date ? formatDate(date) : "",
    }).toString();

    navigate(`/tour-search?${params}`);
  };

  const destinations = [
    {
      name: "Hạ Long Bay",
      price: "From $199",
      image: "/images/destination1.jpg",
    },
    { name: "Phú Quốc", price: "From $249", image: "/images/destination2.jpg" },
    { name: "Đà Nẵng", price: "From $179", image: "/images/destination3.jpg" },
    {
      name: "Nha Trang",
      price: "From $159",
      image: "/images/destination4.jpg",
    },
    { name: "Hội An", price: "From $189", image: "/images/destination5.jpg" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/backgrounds/hero-bg.png')" }}
      >
        {/* overlay */}
        <div className="bg-black bg-opacity-50 absolute inset-0"></div>

        {/* content */}
        <div className="relative z-10 text-white px-6 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">LIVE & TRAVEL</h1>
          <p className="text-lg md:text-2xl mb-8">
            Special offers to suit your plan
          </p>

          {/* Search Box */}
          <TourSearchBar
            destination={destination}
            setDestination={setDestination}
            departure={departure}
            setDeparture={setDeparture}
            date={date}
            setDate={setDate}
            onSearch={handleSearch}
          />
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-50">
        <FeaturedDestinations
          title="Featured Destinations"
          destinations={destinations}
        />
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-500 text-white text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready for your next adventure?
        </h2>
        <p className="mb-6">Book your dream vacation with the best deals</p>
        <button
          onClick={handleGetStarted}
          className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
