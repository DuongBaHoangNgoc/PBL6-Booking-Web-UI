import { useNavigate } from "react-router-dom";
import FeaturedDestinations from "../components/FeaturedDestinations";

export default function Home({ user }) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard"); // nếu đã login thì sang dashboard
    } else {
      navigate("/login"); // nếu chưa login thì sang login
    }
  };

  const destinations = [
    {
      name: "Hạ Long Bay",
      price: "From $199",
      image: "/images/destination1.jpg",
    },
    { name: "Phú Quốc", price: "From $249", image: "/images/destination2.jpg" },
    { name: "Đà Nẵng", price: "From $179", image: "/images/destination3.jpg" },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/backgrounds/hero-bg.png')" }}
      >
        <div className="bg-black bg-opacity-50 absolute inset-0"></div>
        <div className="relative z-10 text-white px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">LIVE & TRAVEL</h1>
          <p className="text-lg md:text-2xl mb-8">
            Special offers to suit your plan
          </p>

          {/* Search Box */}
          <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
            <input
              type="text"
              placeholder="Where are you going?"
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none"
            />
            <input
              type="date"
              className="border rounded-lg px-4 py-2 focus:outline-none"
            />
            <input
              type="number"
              placeholder="Guests"
              className="w-28 border rounded-lg px-4 py-2 focus:outline-none"
            />
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              Search
            </button>
          </div>
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
          className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}
