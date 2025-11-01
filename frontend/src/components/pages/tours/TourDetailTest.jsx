import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  Check,
  AlertCircle,
} from "lucide-react";
import { useParams, Link } from "react-router-dom"; // Thêm useParams, Link
// import { getTourById } from "@/api/tours"; // (Sẽ dùng sau)

// Mock tour data - (Sẽ được thay bằng API)
const mockTour = {
  id: "1", // Sẽ bị ghi đè
  title: "Bali Paradise Escape",
  destination: "Bali, Indonesia",
  price: 1299,
  originalPrice: 1599,
  duration: "7 days",
  travelers: "2-4 people",
  rating: 4.8,
  reviewCount: 324,
  description:
    "Experience the magic of Bali with our carefully curated 7-day escape. From pristine beaches to ancient temples, discover the best of this tropical paradise.",
  highlights: [
    "Luxury beachfront resort accommodation",
    "Daily breakfast and dinner included",
    "Guided tours to Ubud temples",
    "Spa and wellness treatments",
    "Water sports activities",
    "Traditional Balinese cooking class",
  ],
  itinerary: [
    {
      day: 1,
      title: "Arrival in Bali",
      description:
        "Arrive at Denpasar Airport and transfer to your resort. Evening beach walk and dinner.",
    },
    {
      day: 2,
      title: "Ubud Cultural Tour",
      description:
        "Visit ancient temples, rice terraces, and local markets. Traditional lunch included.",
    },
    {
      day: 3,
      title: "Beach Day & Water Sports",
      description:
        "Relax on pristine beaches. Optional surfing, snorkeling, or jet skiing.",
    },
  ],
  included: [
    "7 nights accommodation in 5-star resort",
    "Daily breakfast and dinner",
    "Airport transfers",
    "Guided tours and activities",
  ],
  notIncluded: ["International flights", "Visa fees", "Personal expenses"],
  reviews: [
    {
      author: "Sarah Johnson",
      rating: 5,
      text: "Amazing experience! Everything was perfectly organized. Highly recommended!",
      date: "2 weeks ago",
    },
  ],
};

export default function TourDetail() {
  const { id, slug } = useParams(); // Lấy id và slug từ URL
  const [tour, setTour] = useState(null); // State để chứa data
  const [loading, setLoading] = useState(true);

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [travelers, setTravelers] = useState(1);

  // Giả lập việc fetch data (sau này thay bằng API)
  useEffect(() => {
    setLoading(true);
    // (Sau này) const data = await getTourById(id);
    // Giả lập:
    const data = {
      ...mockTour,
      id: id,
      title: slug.replace(/-/g, " ").toUpperCase(),
    }; // Dùng id và slug từ URL
    setTour(data);
    setLoading(false);
  }, [id, slug]); // Chạy lại khi id hoặc slug thay đổi

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading tour details...
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Tour not found.
      </div>
    );
  }

  return (
    // Component này render bên trong ClientLayout
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        {/* Hero Image */}
        <div className="mb-8 rounded-lg overflow-hidden h-96 bg-muted">
          <img
            src="https://placehold.co/1200x400/0D9488/FFFFFF?text=Tour+Detail+Hero"
            alt={tour.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {tour.title}
                  </h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{tour.destination}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  <Heart
                    className={`w-6 h-6 ${
                      isWishlisted
                        ? "fill-accent text-accent"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(tour.rating)
                            ? "fill-accent text-accent"
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-foreground">
                    {tour.rating}
                  </span>
                  <span className="text-muted-foreground">
                    ({tour.reviewCount} reviews)
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground">
                {tour.description}
              </p>
            </div>

            {/* Highlights */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Tour Highlights
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tour.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Itinerary */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Itinerary
              </h2>
              <div className="space-y-4">
                {tour.itinerary.map((item) => (
                  <Card key={item.day} className="p-4">
                    <h3 className="font-bold text-lg text-foreground mb-2">
                      Day {item.day}: {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* What's Included */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Included
                </h3>
                <ul className="space-y-2">
                  {tour.included.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-foreground"
                    >
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  Not Included
                </h3>
                <ul className="space-y-2">
                  {tour.notIncluded.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Guest Reviews
              </h2>
              <div className="space-y-4">
                {tour.reviews.map((review, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-foreground">
                          {review.author}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {review.date}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-accent text-accent"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-foreground">{review.text}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div>
            <Card className="p-6 sticky top-20 space-y-6">
              {/* Price */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    ${tour.price}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    ${tour.originalPrice}
                  </span>
                </div>
                <p className="text-sm text-accent font-medium">
                  Save ${tour.originalPrice - tour.price}
                </p>
              </div>

              {/* Tour Info */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{tour.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="text-foreground">{tour.travelers}</span>
                </div>
              </div>

              {/* Booking Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Number of Travelers
                  </label>
                  <select
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Person" : "People"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Price
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    ${tour.price * travelers}
                  </p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg">
                  Book Now
                </Button>

                <Button variant="outline" className="w-full bg-transparent">
                  Add to Wishlist
                </Button>
              </div>

              {/* Info */}
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">Free Cancellation</span> up to
                  7 days before departure
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
