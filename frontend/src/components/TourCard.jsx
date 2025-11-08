import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function TourCard({ tour }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Card className="relative w-full rounded-3xl overflow-hidden aspect-square cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${tour.image})` }}
      />

      {/* Dark Overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isHovered ? "bg-black/60" : "bg-black/20"}`}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">

        <div className="flex-shrink-0 transition-all duration-300">
          {!isHovered ? (
            // Default State - Show basic info
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl font-bold text-white text-balance">{tour.title}</h2>

              <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <MapPin size={20} />
                  <span>{tour.destination}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <DollarSign size={20} />
                  <span>Start from {tour.price}</span>
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2">
                  <Clock size={20} />
                  <span>{tour.time.toString}</span>
                </div>
              </div>
            </div>
          ) : (
            // Hover State - Show description and button
            <div className="flex flex-col gap-6 p-8 animate-in fade-in items-center text-center justify-center">
            <h2 className="text-4xl font-bold text-white leading-tight">{tour.title}</h2>
            
            {/* Info Row */}
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-2">
                <DollarSign size={20} />
                <span>Start from {tour.price}</span>
              </div>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <Clock size={20} />
                <span>{tour.time}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-base leading-relaxed text-gray-100">
              {tour.description}
            </p>

            {/* Learn More Button */}
            <Link to={`/tours/${tour.tourId}/${tour.slug}`}>
              <button className="w-fit px-8 py-3 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:text-black transition-colors duration-200 justify-center">
                Learn More
              </button>
            </Link>
          </div>
          )}
        </div>

        {/* Rating
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(tour.starAvg) ? "fill-accent text-accent" : "text-muted"
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-foreground">{tour.starAvg}</span>
          <span className="text-sm text-muted-foreground">({tour.reviewCount})</span>
        </div> */}

        {/* Price */}
        {/* <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">${tour.price}</span>
          <span className="text-sm text-muted-foreground line-through">
            ${tour.originalPrice}
          </span>
        </div> */}

        {/* Button */}
        {/* <Link to={`/tours/${tour.tourId}/${tour.slug}`} className="block">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details
          </Button>
        </Link> */}
      </div>
    </Card>
  );
}
