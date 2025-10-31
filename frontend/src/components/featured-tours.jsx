"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Users } from "lucide-react"

const tours = [
  {
    id: 1,
    title: "Bali Paradise Escape",
    destination: "Bali, Indonesia",
    price: 1299,
    originalPrice: 1599,
    duration: "7 days",
    travelers: "2-4 people",
    rating: 4.8,
    reviews: 324,
    image: "/images/destination1.jpg",
  },
  {
    id: 2,
    title: "Tokyo Cultural Tour",
    destination: "Tokyo, Japan",
    price: 1599,
    originalPrice: 1899,
    duration: "5 days",
    travelers: "2-6 people",
    rating: 4.9,
    reviews: 456,
    image: "/images/destination2.jpg",
  },
  {
    id: 3,
    title: "Paris Romance Package",
    destination: "Paris, France",
    price: 1399,
    originalPrice: 1799,
    duration: "6 days",
    travelers: "2-4 people",
    rating: 4.7,
    reviews: 512,
    image: "/images/destination3.jpg",
  },
  {
    id: 4,
    title: "New York City Adventure",
    destination: "New York, USA",
    price: 999,
    originalPrice: 1299,
    duration: "4 days",
    travelers: "1-6 people",
    rating: 4.6,
    reviews: 289,
    image: "/images/destination4.jpg",
  },
]

export function FeaturedTours() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Featured Tours</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked destinations and experiences for unforgettable memories
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={tour.image || "/placeholder.svg"}
                  alt={tour.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  Save ${tour.originalPrice - tour.price}
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
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{tour.travelers}</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(tour.rating) ? "fill-accent text-accent" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{tour.rating}</span>
                  <span className="text-sm text-muted-foreground">({tour.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">${tour.price}</span>
                  <span className="text-sm text-muted-foreground line-through">${tour.originalPrice}</span>
                </div>

                {/* Button */}
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">View Details</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
