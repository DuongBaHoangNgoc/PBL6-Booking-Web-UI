import { Link } from "react-router-dom"
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white pt-20 pb-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* ================= BRAND COLUMN ================= */}
          <div className="space-y-6">
            {/* Logo đồng bộ với Navbar/Home */}
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold text-xl shadow-lg group-hover:scale-105 transition-transform">
                ✈
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                BOOKING
              </span>
            </Link>
            
            <p className="text-blue-50 text-sm leading-relaxed max-w-xs">
              Discover and book amazing travel experiences worldwide with our expert guides and best prices. Your adventure starts here.
            </p>
            
            {/* Social Icons - Dạng nút tròn hiện đại */}
            <div className="flex gap-4 pt-2">
              {[Facebook, Twitter, Instagram].map((Icon, idx) => (
                <a 
                  key={idx}
                  href="#" 
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:-translate-y-1 shadow-sm border border-white/20"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div className="space-y-6">
            <h3 className="font-bold text-white text-lg relative inline-block">
              Quick Links
              {/* Gạch chân màu trắng mờ */}
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-white/50 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "Tours", path: "/tours" },
                { label: "Destinations", path: "/destinations" },
                { label: "Blog", path: "/blog" },
                { label: "Reviews", path: "/reviews" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-blue-50 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= SUPPORT ================= */}
          <div className="space-y-6">
            <h3 className="font-bold text-white text-lg relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-white/50 rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: "FAQ", path: "/faq" },
                { label: "Contact Us", path: "/contact" },
                { label: "Privacy Policy", path: "/privacy" },
                { label: "Terms & Conditions", path: "/terms" }
              ].map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-blue-50 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-1 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ================= CONTACT INFO ================= */}
          <div className="space-y-6">
            <h3 className="font-bold text-white text-lg relative inline-block">
              Contact Us
              <span className="absolute -bottom-2 left-0 w-10 h-1 bg-white/50 rounded-full"></span>
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 group">
                {/* Icon màu trắng/xanh nhạt */}
                <Mail className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <div>
                  <p className="text-xs text-blue-100 uppercase font-semibold">Email us</p>
                  <span className="text-white font-medium">info@travelhub.com</span>
                </div>
              </div>
              
              <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 group">
                <Phone className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <div>
                  <p className="text-xs text-blue-100 uppercase font-semibold">Call us</p>
                  <span className="text-white font-medium">+1 (555) 123-4567</span>
                </div>
              </div>

              <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition border border-white/10 group">
                <MapPin className="w-5 h-5 text-blue-100 flex-shrink-0 mt-0.5 group-hover:text-white transition-colors" />
                <div>
                  <p className="text-xs text-blue-100 uppercase font-semibold">Visit us</p>
                  <span className="text-white font-medium">123 Travel Street, City, Country</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="border-t border-white/20 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-blue-50 gap-4">
            <p>&copy; 2025 TravelHub. All rights reserved.</p>
            <div className="flex gap-8">
              <Link to="/terms" className="hover:text-white transition font-medium">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition font-medium">Privacy</Link>
              <Link to="/cookies" className="hover:text-white transition font-medium">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}