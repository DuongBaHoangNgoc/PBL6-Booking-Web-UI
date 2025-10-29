// Đã xóa "use client" - không cần thiết trong React/Vite
import { Link } from "react-router-dom"; // Thay đổi import từ "next/link"
import { MapPin, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-primary">
              <MapPin className="w-5 h-5" />
              <span>TravelHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover and book amazing travel experiences worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/tours"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Tours
                </Link>
              </li>
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/destinations"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/blog"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/faq"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                {/* Thay 'href' bằng 'to' */}
                <Link
                  to="/privacy"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>info@travelhub.com</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; 2025 TravelHub. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            {/* Thay 'href' bằng 'to' */}
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
            {/* Thay 'href' bằng 'to' */}
            <Link
              to="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            {/* Thay 'href' bằng 'to' */}
            <Link
              to="/cookies"
              className="hover:text-primary transition-colors"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}