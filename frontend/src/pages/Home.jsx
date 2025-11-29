import { useNavigate } from "react-router-dom"
import TourSearchBar from "../components/pages/tours/TourSearchBar"
import { useState } from "react"
import { useAuth } from "@/context/useAuth"
import { ArrowRight, MapPin, Users, Award, Star, Quote, Globe, Camera, Umbrella, Coffee } from "lucide-react"
import { FeaturedTours } from "@/components/featured-tours"

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [destination, setDestination] = useState("")
  const [departure, setDeparture] = useState("Hồ Chí Minh")
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

  // Dữ liệu giả lập cho Categories - Thêm màu sắc riêng cho từng loại
  const categories = [
    { name: "Beach", icon: Umbrella, count: "120+ Tours", color: "from-blue-500 to-cyan-400", bg: "bg-blue-50" },
    { name: "Mountain", icon: MapPin, count: "80+ Tours", color: "from-emerald-500 to-teal-400", bg: "bg-emerald-50" },
    { name: "City", icon: Globe, count: "200+ Tours", color: "from-violet-500 to-purple-400", bg: "bg-violet-50" },
    { name: "Culture", icon: Camera, count: "50+ Tours", color: "from-amber-500 to-orange-400", bg: "bg-amber-50" },
    { name: "Food", icon: Coffee, count: "40+ Tours", color: "from-rose-500 to-pink-400", bg: "bg-rose-50" },
  ]

  // Dữ liệu giả lập cho Destinations
  const popularDestinations = [
    { name: "Hạ Long Bay", tours: 25, image: "/images/destination1.jpg", colSpan: "md:col-span-2", rowSpan: "md:row-span-2" },
    { name: "Hội An", tours: 18, image: "/images/destination5.jpg", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
    { name: "Phú Quốc", tours: 30, image: "/images/destination2.jpg", colSpan: "md:col-span-1", rowSpan: "md:row-span-1" },
    { name: "Đà Nẵng", tours: 22, image: "/images/destination3.jpg", colSpan: "md:col-span-2", rowSpan: "md:row-span-1" },
  ]

  // Dữ liệu giả lập Testimonials
  const testimonials = [
    { name: "Alice Nguyen", role: "Traveler", text: "The trip to Ha Long Bay was magical. Everything was well organized!", avatar: "A" },
    { name: "John Smith", role: "Photographer", text: "Great guides, amazing locations. I took some of my best photos here.", avatar: "J" },
    { name: "Tran Minh", role: "Family Trip", text: "My kids loved the Phu Quoc tour. Highly recommended for families.", avatar: "T" },
  ]

  return (
    <div className="font-sans text-slate-800">
      {/* ================= HERO SECTION ================= */}
      <section
        className="relative min-h-[85vh] bg-cover bg-center flex items-center justify-center text-center"
        style={{ backgroundImage: "url('/images/destination1.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60"></div>

        {/* content */}
        <div className="relative z-10 w-full max-w-5xl px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-600/20 border border-blue-400/30 text-blue-100 text-sm font-medium mb-4 backdrop-blur-sm">
            Let's explore the world together
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 text-white tracking-tight drop-shadow-lg">
            Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-200">Perfect Trip</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Discover hidden wonders and book unique experiences with exclusive deals tailored just for you.
          </p>

          {/* Search Box Wrapper */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl">
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
        </div>
      </section>

      {/* ================= CATEGORIES SECTION (UPDATED) ================= */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Browse by Category</h2>
              <p className="text-slate-500 mt-2">Pick a vibe for your next vacation</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((cat, idx) => (
              <div 
                key={idx} 
                className="group relative h-64 cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                {/* Background Layer - Default Light */}
                <div className={`absolute inset-0 ${cat.bg} transition-opacity duration-300 group-hover:opacity-0`}></div>
                
                {/* Background Layer - Hover Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}></div>
                
                {/* Content Container */}
                <div className="relative z-10 flex h-full flex-col justify-between p-6">
                  {/* Icon Box */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm transition-all duration-300 group-hover:bg-white/20 group-hover:text-white text-slate-700">
                    <cat.icon className="h-6 w-6" />
                  </div>
                  
                  {/* Text */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-white">
                      {cat.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                       <span className="h-px w-4 bg-slate-400 group-hover:bg-white/60 transition-colors"></span>
                       <span className="text-xs font-medium text-slate-500 transition-colors group-hover:text-white/90">
                         {cat.count}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Decorative Big Icon (Floating in background) */}
                <cat.icon 
                  className="absolute -bottom-8 -right-8 h-32 w-32 text-slate-900/5 transition-all duration-500 group-hover:-bottom-4 group-hover:-right-4 group-hover:scale-110 group-hover:rotate-12 group-hover:text-white/20" 
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED TOURS ================= */}
      <FeaturedTours />

      {/* ================= POPULAR DESTINATIONS (Masonry Grid) ================= */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
           <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Popular Destinations</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">From historical cities to natural wonders, explore the most visited places in Vietnam.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {popularDestinations.map((dest, idx) => (
              <div 
                key={idx} 
                className={`relative rounded-2xl overflow-hidden group cursor-pointer ${dest.colSpan} ${dest.rowSpan}`}
                onClick={() => navigate(`/tours?keyword=${dest.name}`)}
              >
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 p-6">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Top Rated</span>
                  <h3 className="text-2xl font-bold text-white mb-1">{dest.name}</h3>
                  <p className="text-slate-200 text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {dest.tours} Tours Available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US (Split Layout) ================= */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Left Content */}
            <div className="lg:w-1/2">
              <span className="text-blue-600 font-bold tracking-wider text-sm uppercase mb-2 block">Why Choose Us</span>
              <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">We Make Your Travel <br/>More Enjoyable</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                We are dedicated to providing the best travel experience. Our team of experts meticulously plans every detail to ensure your trip is seamless and unforgettable.
              </p>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Best Price Guarantee</h3>
                    <p className="text-slate-500 text-sm mt-1">We ensure you get the most competitive prices for high-quality tours.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Professional Guides</h3>
                    <p className="text-slate-500 text-sm mt-1">Our guides are certified experts with deep local knowledge.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Highly Rated Services</h3>
                    <p className="text-slate-500 text-sm mt-1">Trusted by thousands of travelers with 5-star reviews.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image Composition */}
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-100 rounded-full blur-3xl opacity-50"></div>
              
              <div className="relative grid grid-cols-2 gap-4">
                <img src="/images/destination2.jpg" alt="Experience" className="rounded-2xl shadow-xl w-full h-64 object-cover translate-y-8" />
                <img src="/images/destination3.jpg" alt="Experience" className="rounded-2xl shadow-xl w-full h-64 object-cover" />
              </div>
              
              {/* Floating Badge */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce"
                style={{ animationDuration: '3s' }}
              >
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Destinations</p>
                  <p className="font-bold text-slate-900">500+ Places</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900">What Our Travelers Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition border border-slate-100 relative">
                <Quote className="w-10 h-10 text-blue-100 absolute top-6 right-6" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                    {item.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{item.name}</h4>
                    <p className="text-sm text-blue-600">{item.role}</p>
                  </div>
                </div>
                <p className="text-slate-600 italic">"{item.text}"</p>
                <div className="flex gap-1 mt-4 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA SECTION (Newsletter) ================= */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-700">
           {/* Abstract Background Patterns */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10" 
                style={{backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready for your next adventure?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
            Join 10,000+ travelers and get exclusive offers sent straight to your inbox.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mb-10">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="px-6 py-4 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-amber-300 text-slate-800"
            />
            <button className="bg-amber-400 text-slate-900 px-8 py-4 rounded-lg font-bold hover:bg-amber-300 transition shadow-lg whitespace-nowrap">
              Subscribe
            </button>
          </div>

          <button
            onClick={handleGetStarted}
            className="text-white border-b border-white/30 pb-1 hover:text-amber-300 hover:border-amber-300 transition text-sm font-medium"
          >
            Or start browsing tours immediately <ArrowRight className="w-4 h-4 inline ml-1" />
          </button>
        </div>
      </section>
    </div>
  )
}