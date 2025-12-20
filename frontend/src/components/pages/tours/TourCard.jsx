import { Card } from "@/components/ui/card";
import { MapPin, Clock, DollarSign, ArrowRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function TourCard({ tour }) {
  const [isHovered, setIsHovered] = useState(false);

  // Xử lý giá trị mặc định nếu thiếu dữ liệu
  const title = tour.title || "Unknown Tour";
  const image = tour.image || "/placeholder.svg";
  const price = tour.price || 0;
  const time = tour.time || "N/A";
  const destination = tour.destination || "Vietnam";
  const description = tour.description || "Explore the beauty of this amazing destination with our exclusive tour package.";
  const rating = tour.starAvg || 4.5;

  return (
    <Card 
      className="relative w-full rounded-3xl overflow-hidden aspect-[3/4] cursor-pointer group shadow-xl border-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ================= BACKGROUND IMAGE ================= */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-110"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* ================= OVERLAYS ================= */}
      {/* Lớp nền tĩnh để làm rõ chữ khi chưa hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-0" />
      
      {/* Lớp nền active khi hover (Theme Ocean: Xanh đậm) */}
      <div 
        className={`absolute inset-0 bg-gradient-to-t from-blue-900/95 via-blue-900/80 to-blue-600/30 backdrop-blur-[2px] transition-all duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`} 
      />

      {/* ================= CONTENT ================= */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white h-full">
        
        {/* Rating Badge (Luôn hiện ở góc trên) */}
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-bold">{rating}</span>
        </div>

        <div className="flex flex-col h-full justify-end">
          {/* ----- TRẠNG THÁI BÌNH THƯỜNG (Hiện Title & Info cơ bản) ----- */}
          <div className={`transition-all duration-300 transform ${isHovered ? "-translate-y-4 opacity-0 hidden" : "translate-y-0 opacity-100"}`}>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight drop-shadow-md line-clamp-2">
              {title}
            </h2>

            <div className="flex items-center gap-4 text-sm font-medium text-blue-50">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span className="truncate max-w-[100px]">{destination}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/50" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{time}</span>
              </div>
            </div>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-xs text-blue-200">From</span>
              <span className="text-xl font-bold text-white">${price}</span>
            </div>
          </div>

          {/* ----- TRẠNG THÁI HOVER (Hiện Chi tiết & Nút) ----- */}
          {isHovered && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col items-center text-center justify-center h-full gap-4">
              
              <h2 className="text-2xl font-bold text-white leading-tight mb-2">
                {title}
              </h2>

              <div className="flex flex-wrap justify-center gap-3 text-sm text-blue-100 mb-2">
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md border border-white/10">
                  <MapPin className="w-3 h-3 text-cyan-300" /> {destination}
                </span>
                <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-md border border-white/10">
                  <Clock className="w-3 h-3 text-cyan-300" /> {time}
                </span>
              </div>
              
              <p className="text-sm text-blue-50 line-clamp-3 leading-relaxed max-w-xs">
                {description}
              </p>

              <div className="mt-4">
                 <div className="text-2xl font-bold text-cyan-300 mb-4">${price}</div>
                 
                 <Link to={`/tours/${tour.tourId}/${tour.slug}`} className="w-full">
                  <button className="group/btn relative overflow-hidden rounded-full bg-white px-8 py-3 font-bold text-blue-600 transition-all hover:bg-cyan-50 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                    <span className="relative flex items-center gap-2">
                      View Details <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}