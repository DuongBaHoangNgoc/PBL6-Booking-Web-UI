"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Download, X, Heart, ChevronDown } from "lucide-react"

const allBookings = [
  {
    id: 1,
    tour: "Bali Paradise Escape",
    destination: "Bali, Indonesia",
    checkIn: "2025-06-15",
    checkOut: "2025-06-22",
    travelers: 2,
    status: "Confirmed",
    price: 2598,
    image: "/bali-beach-resort.jpg",
    rating: 4.8,
    reviews: 324,
  },
  {
    id: 2,
    tour: "Tokyo Cultural Tour",
    destination: "Tokyo, Japan",
    checkIn: "2025-07-20",
    checkOut: "2025-07-25",
    travelers: 1,
    status: "Pending",
    price: 1599,
    image: "/tokyo-city-night.jpg",
    rating: 4.5,
    reviews: 156,
  },
  {
    id: 3,
    tour: "Paris Romance Package",
    destination: "Paris, France",
    checkIn: "2025-08-10",
    checkOut: "2025-08-16",
    travelers: 2,
    status: "Confirmed",
    price: 2798,
    image: "/paris-eiffel-tower.jpg",
    rating: 4.9,
    reviews: 287,
  },
  {
    id: 4,
    tour: "New York City Adventure",
    destination: "New York, USA",
    checkIn: "2025-09-05",
    checkOut: "2025-09-09",
    travelers: 3,
    status: "Cancelled",
    price: 2997,
    image: "/new-york-skyline.jpg",
    rating: 4.6,
    reviews: 198,
  },
]

export function BookingsPage() {
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [sortBy, setSortBy] = useState("Recommended")
  const [favorites, setFavorites] = useState([])

  const filteredBookings =
    selectedStatus === "All" ? allBookings : allBookings.filter((b) => b.status === selectedStatus)

  const bookingsInPriceRange = filteredBookings.filter((b) => b.price >= priceRange[0] && b.price <= priceRange[1])

  const toggleFavorite = (id) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  return (
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="space-y-6">
              {/* Status Filter */}
              <div>
                <h3 className="font-semibold text-foreground mb-4">Status</h3>
                <div className="space-y-2">
                  {["All", "Confirmed", "Pending", "Cancelled"].map((status) => (
                    <label key={status} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={selectedStatus === status}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{status}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Price</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="space-y-4">
                  <input
                    type="range"
                    min="0"
                    max="5000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Rating</h3>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  {["0+", "1+", "2+", "3+", "4+"].map((rating) => (
                    <button
                      key={rating}
                      className="px-3 py-1 text-xs border border-border rounded hover:border-primary transition-colors"
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with Tabs and Sort */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-8 border-b border-border">
                  <button className="pb-3 font-medium text-foreground border-b-2 border-primary">
                    My Bookings ({bookingsInPriceRange.length})
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-medium text-foreground bg-transparent border-none cursor-pointer"
                  >
                    <option>Recommended</option>
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Showing {bookingsInPriceRange.length} of {allBookings.length} bookings
              </p>
            </div>

            {/* Bookings Grid */}
            <div className="space-y-4">
              {bookingsInPriceRange.map((booking) => (
                <Card
                  key={booking.id}
                  className="overflow-hidden hover:shadow-md transition-shadow border border-border"
                >
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="relative w-48 h-40 flex-shrink-0 rounded-lg overflow-hidden group">
                      <img
                        src={booking.image || "/placeholder.svg"}
                        alt={booking.tour}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-foreground">
                        {booking.travelers} images
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{booking.tour}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{booking.destination}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">starting from</p>
                            <p className="text-xl font-bold text-accent">${booking.price}</p>
                            <p className="text-xs text-muted-foreground">per night</p>
                          </div>
                        </div>

                        {/* Rating and Status */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">{booking.rating}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < Math.floor(booking.rating) ? "text-accent" : "text-muted-foreground"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{booking.reviews} reviews</span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              booking.status === "Confirmed"
                                ? "bg-primary/10 text-primary"
                                : booking.status === "Pending"
                                  ? "bg-accent/10 text-accent"
                                  : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                        <button
                          onClick={() => toggleFavorite(booking.id)}
                          className="p-2 hover:bg-muted rounded transition-colors"
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.includes(booking.id) ? "fill-accent text-accent" : "text-muted-foreground"
                            }`}
                          />
                        </button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 text-foreground border-border hover:bg-muted bg-transparent"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </Button>
                        {booking.status === "Confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-foreground border-border hover:bg-muted bg-transparent"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </Button>
                        )}
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground ml-auto">
                          View Place
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Show More Button */}
            {bookingsInPriceRange.length > 0 && (
              <Button
                variant="outline"
                className="w-full mt-8 bg-foreground text-background hover:bg-foreground/90 border-none font-medium"
              >
                Show more results
              </Button>
            )}

            {/* Empty State */}
            {bookingsInPriceRange.length === 0 && (
              <Card className="p-12 text-center border border-border">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No bookings found</h3>
                <p className="text-muted-foreground mb-6">
                  You don't have any {selectedStatus.toLowerCase()} bookings in this price range
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Browse Tours</Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
