import { useNavigate } from "react-router-dom"
import FeaturedDestinations from "../components/FeaturedDestinations"
import TourSearchBar from "../components/pages/tours/TourSearchBar"
import { useState } from "react"
import { useAuth } from "@/context/useAuth"
import { ArrowRight, MapPin, Users, Award } from "lucide-react"
import { SearchBar } from "@/components/search-bar"
import { FeaturedTours } from "@/components/featured-tours"

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [destination, setDestination] = useState("")
  const [departure, setDeparture] = useState("Hồ Chí Minh")
  const [date, setDate] = useState(null)

  const handleGetStarted = () => {
    navigate(user ? "/tour" : "/auth/login")
  }

  const formatDate = (d) => {
    if (!d) return ""
    const dt = d instanceof Date ? d : new Date(d)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, "0")
    const dd = String(dt.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  const handleSearch = () => {
    if (!destination.trim()) return

    const params = new URLSearchParams({
      keyword: destination,
      departure,
      from: date ? formatDate(date) : "",
    }).toString()

    navigate(`/tours?${params}`)
  }

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
    { name: "Hội An", price: "From $189", image: "/images/destination.jpg" },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/images/destination1.jpg')" }}
      >
        <div className="bg-gradient-to-b from-black/60 via-black/50 to-black/40 absolute inset-0"></div>

        {/* content */}
        <div className="relative z-10 text-white px-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-balance">Discover Your Next Adventure</h1>
          <p className="text-lg md:text-2xl mb-12 text-blue-100">Special offers to suit your plan</p>

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

      <FeaturedTours />

      {/* Featured Destinations */}
      {/* <section className="py-20 bg-gray-50">
        <FeaturedDestinations title="Featured Destinations" destinations={destinations} />
      </section> */}

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-blue-50 hover:shadow-lg transition">
              <MapPin className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Destinations</h3>
              <p className="text-gray-600">Explore the most beautiful and exotic destinations around the world</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-orange-50 hover:shadow-lg transition">
              <Users className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Guides</h3>
              <p className="text-gray-600">Travel with experienced guides who know every corner of the destination</p>
            </div>
            <div className="text-center p-8 rounded-xl bg-green-50 hover:shadow-lg transition">
              <Award className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Get the best deals and exclusive offers for your dream vacation</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready for your next adventure?</h2>
          <p className="mb-8 text-blue-100 text-lg">Book your dream vacation with the best deals and expert guidance</p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-bold hover:bg-green-50 transition inline-flex items-center gap-2 text-lg"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
