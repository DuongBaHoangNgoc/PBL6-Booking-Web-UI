import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function TourCard({ tour }) {
  // Hàm tạo slug đơn giản
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        <img
          src={tour.image || "https://placehold.co/600x400"}
          alt={tour.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
          Save ${tour.originalPrice - tour.price}
        </div>
        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {tour.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground mb-2">{tour.title}</h3>

        {/* Destination */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span>{tour.destination}</span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{tour.time}</span>
          </div>
        </div>

        {/* Rating */}
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
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-primary">${tour.price}</span>
          <span className="text-sm text-muted-foreground line-through">
            ${tour.originalPrice}
          </span>
        </div>

        {/* Button */}
        <Link to={`/tours/${tour.tourId}/${tour.slug}`} className="block">
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}
