import { useNavigate } from "react-router-dom"
import TourSearchBar from "../components/pages/tours/TourSearchBar"
import { useState } from "react"
import { useAuth } from "@/context/useAuth"
import { ArrowRight, MapPin, Users, Award, Star, Quote, Globe, Camera, Umbrella, Coffee, Zap } from "lucide-react"
import { FeaturedTours } from "@/components/featured-tours"

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [destination, setDestination] = useState("")
  const [departure, setDeparture] = useState("Ho Chi Minh City")
  const [date, setDate] = useState(null)

  const handleGetStarted = () => {
    navigate(user ? "/tours" : "/auth/login")
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

  // Categories Data (Translated)
  const categories = [
    { name: "Beaches", icon: Umbrella, count: "120+ Tours", color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Mountains", icon: MapPin, count: "80+ Tours", color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "City", icon: Globe, count: "200+ Tours", color: "text-violet-500", bg: "bg-violet-50" },
    { name: "Culture", icon: Camera, count: "50+ Tours", color: "text-amber-500", bg: "bg-amber-50" },
    { name: "Food", icon: Coffee, count: "40+ Tours", color: "text-rose-500", bg: "bg-rose-50" },
  ]

  // Destinations Data (Translated names where applicable)
  const popularDestinations = [
    { name: "Ha Long Bay", tours: 25, image: "/images/destination1.jpg", colSpan: "md:col-span-2 md:row-span-2", height: "h-64 md:h-full" },
    { name: "Hoi An", tours: 18, image: "/images/destination5.jpg", colSpan: "md:col-span-1 md:row-span-1", height: "h-64" },
    { name: "Phu Quoc", tours: 30, image: "/images/destination2.jpg", colSpan: "md:col-span-1 md:row-span-1", height: "h-64" },
    { name: "Da Nang", tours: 22, image: "/images/destination3.jpg", colSpan: "md:col-span-2 md:row-span-1", height: "h-64" },
  ]

  // Testimonials Data (Translated)
  const testimonials = [
    { name: "Alice Nguyen", role: "Traveler", text: "The trip to Ha Long Bay was amazing. Everything was organized very professionally!", avatar: "A" },
    { name: "Minh Tran", role: "Photographer", text: "Enthusiastic guides, excellent scenery. I took some photos of a lifetime.", avatar: "M" },
    { name: "Sarah Pham", role: "Family Trip", text: "My family loved the Phu Quoc tour. Great service, reasonable price.", avatar: "S" },
  ]

  return (
    <div className="font-sans text-slate-800 bg-slate-50">

      {/* ================= HERO SECTION (Bright Overlay) ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-1000 scale-105"
          style={{ backgroundImage: "url('/images/destination1.jpg')" }}
        ></div>

        {/* Overlay: Blending Blue (Navbar) downwards */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-black/20 to-slate-900/60 z-10"></div>

        {/* Hero Content */}
        <div className="relative z-20 container mx-auto px-4 text-center mt-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 shadow-lg">
            <Zap className="w-4 h-4 text-yellow-300" /> Explore the world your way
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100 drop-shadow-lg">
            Travel <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">Without Limits</span>
          </h1>

          <p className="text-lg md:text-xl text-blue-50 max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 drop-shadow-md">
            Book all-inclusive tours, hotels, and flights at the best prices. Experience new lands with us.
          </p>

          {/* Search Box */}
          {/* <div className="bg-white/20 backdrop-blur-lg border border-white/30 p-2 md:p-3 rounded-3xl shadow-2xl max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <TourSearchBar
              destination={destination}
              setDestination={setDestination}
              departure={departure}
              setDeparture={setDeparture}
              date={date}
              setDate={setDate}
              onSearch={handleSearch}
            />
          </div> */}
        </div>
      </section>

      {/* ================= CATEGORIES SECTION ================= */}
      <section className="py-20 container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Popular Categories</h2>
          <p className="text-slate-500 mt-2">Choose your favorite travel style</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              className="group cursor-pointer bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-cyan-100 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              onClick={() => navigate(`/tours?category=${cat.name}`)}
            >
              <div className={`w-16 h-16 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <cat.icon className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">{cat.name}</h3>
              <p className="text-xs text-slate-400 font-medium">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED TOURS ================= */}
      <div className="bg-white py-10">
        <FeaturedTours />
      </div>

      {/* ================= POPULAR DESTINATIONS ================= */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Top Destinations</h2>
              <p className="text-slate-500 mt-2">Most loved destinations by travelers this year</p>
            </div>
            <button onClick={() => navigate('/destinations')} className="text-cyan-600 font-semibold hover:text-blue-600 transition-colors flex items-center gap-1 mt-4 md:mt-0">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-fr">
            {popularDestinations.map((dest, idx) => (
              <div
                key={idx}
                className={`relative rounded-3xl overflow-hidden group cursor-pointer ${dest.colSpan} ${dest.height}`}
                onClick={() => navigate(`/tours?keyword=${dest.name}`)}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay gradient Bright Ocean when hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">{dest.name}</h3>
                  <p className="text-blue-50 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {dest.tours} Tours
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <span className="text-cyan-600 font-bold tracking-wider text-sm uppercase mb-2 block">Why Choose Us?</span>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">Delivering The Perfect <br />Travel Experience</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We are committed to providing memorable trips with high quality service, transparent pricing, and 24/7 dedicated support.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Award, title: "Best Price", desc: "Committed to the most competitive prices in the market", color: "bg-blue-100 text-blue-600" },
                  { icon: Users, title: "Professional Guides", desc: "Knowledgeable and enthusiastic guide team", color: "bg-cyan-100 text-cyan-600" },
                  { icon: Star, title: "5-Star Service", desc: "Thousands of positive reviews from customers", color: "bg-amber-100 text-amber-600" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                      <p className="text-slate-500 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-40"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-cyan-200 rounded-full blur-3xl opacity-40"></div>

              <div className="relative grid grid-cols-2 gap-4">
                <img src="/images/destination2.jpg" alt="Experience" className="rounded-3xl shadow-2xl w-full h-72 object-cover translate-y-8" />
                <img src="/images/destination3.jpg" alt="Experience" className="rounded-3xl shadow-2xl w-full h-72 object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">What Customers Say?</h2>
            <p className="text-slate-500 mt-2">Real feedback from those who have experienced it</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-lg hover:shadow-blue-900/5 transition-all border border-slate-100 relative">
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center font-bold text-white text-lg shadow-md">
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-cyan-600 font-medium">{item.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic leading-relaxed">"{item.text}"</p>
                <div className="flex gap-1 mt-6 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION (White Background) ================= */}
      <section className="py-24 relative overflow-hidden bg-white">
        {/* Light gray dot background pattern */}
        <div className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Ready for your next trip?</h2>
          <p className="text-slate-600 text-lg mb-10 max-w-2xl mx-auto">
            Subscribe to our newsletter so you don't miss out on exclusive offers and exciting travel tips every week.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-10">
            <input
              type="email"
              placeholder="Enter your email address"
              className="px-6 py-4 rounded-xl flex-1 outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-sm border border-slate-200 placeholder:text-slate-400 bg-slate-50 focus:bg-white"
            />
            {/* Gradient button stands out on white background */}
            <button className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap">
              Subscribe Now
            </button>
          </div>

          <button
            onClick={handleGetStarted}
            className="text-blue-600 border-b border-blue-200 pb-1 hover:text-cyan-600 hover:border-cyan-600 transition text-sm font-medium inline-flex items-center gap-2"
          >
            Or start exploring now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  )
}