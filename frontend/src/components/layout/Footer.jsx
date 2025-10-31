import { Link } from "react-router-dom"
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-2xl text-white">
              <span>✈ BOOKING</span>
            </div>
            <p className="text-sm text-green-100 leading-relaxed">
              Discover and book amazing travel experiences worldwide with our expert guides and best prices.
            </p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="text-green-100 hover:text-amber-300 transition transform hover:scale-110">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-green-100 hover:text-amber-300 transition transform hover:scale-110">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-green-100 hover:text-amber-300 transition transform hover:scale-110">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/tours" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Tours
                </Link>
              </li>
              <li>
                <Link to="/destinations" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/reviews" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg">Support</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/faq" className="text-green-100 hover:text-amber-300 transition font-medium">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-green-100 hover:text-amber-300 transition font-medium">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-lg">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-green-100">
                <Mail className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span>info@travelhub.com</span>
              </div>
              <div className="flex items-center gap-3 text-green-100">
                <Phone className="w-5 h-5 text-amber-300 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-3 text-green-100">
                <MapPin className="w-5 h-5 text-amber-300 flex-shrink-0 mt-1" />
                <span>123 Travel Street, City, Country</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-500 pt-8"></div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-green-100">
          <p>&copy; 2025 TravelHub. All rights reserved.</p>
          <div className="flex gap-6 mt-6 md:mt-0">
            <Link to="/terms" className="hover:text-amber-300 transition font-medium">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-amber-300 transition font-medium">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-amber-300 transition font-medium">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
