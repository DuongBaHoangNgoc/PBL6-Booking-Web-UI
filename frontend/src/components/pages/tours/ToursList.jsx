import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Users, Filter } from "lucide-react";
import { Link } from "react-router-dom"; 

const allTours = [
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
    category: "Beach",
    image: "https://placehold.co/600x400/0D9488/FFFFFF?text=Bali+Escape",
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
    category: "Culture",
    image: "https://placehold.co/600x400/F97316/FFFFFF?text=Tokyo+Tour",
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
    category: "Romance",
    image: "https://placehold.co/600x400/EC4899/FFFFFF?text=Paris+Romance",
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
    category: "City",
    image: "https://placehold.co/600x400/EC4899/FFFFFF?text=Paris+Romance",
  },
  {
    id: 5,
    title: "Swiss Alps Adventure",
    destination: "Switzerland",
    price: 1799,
    originalPrice: 2099,
    duration: "8 days",
    travelers: "2-5 people",
    rating: 4.9,
    reviews: 178,
    category: "Adventure",
    image: "https://placehold.co/600x400/F97316/FFFFFF?text=Tokyo+Tour",
  },
  {
    id: 6,
    title: "Maldives Luxury Retreat",
    destination: "Maldives",
    price: 2499,
    originalPrice: 2999,
    duration: "5 days",
    travelers: "2-3 people",
    rating: 5,
    reviews: 234,
    category: "Luxury",
    image: "https://placehold.co/600x400/0D9488/FFFFFF?text=Bali+Escape",
  },
];

const categories = ["All", "Beach", "Culture", "Adventure", "Romance", "City", "Luxury"];

// Đổi tên function ToursList -> TourSearchResult để khớp AppRoutes
export default function TourSearchResult() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  const filteredTours =
    selectedCategory === "All"
      ? allTours
      : allTours.filter((t) => t.category === selectedCategory);

  const sortedTours = [...filteredTours].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0;
  });

  // Hàm tạo slug đơn giản
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  return (
    // Component này render bên trong ClientLayout,
    // nên ta thêm padding cho nó
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Explore Tours</h1>
          <p className="text-muted-foreground">
            Discover amazing destinations and experiences
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                        className={`w-4 h-4 ${
                          i < Math.floor(tour.rating) ? "fill-accent text-accent" : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">{tour.rating}</span>
                  <span className="text-sm text-muted-foreground">({tour.reviews})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">${tour.price}</span>
                  <span className="text-sm text-muted-foreground line-through">
                    ${tour.originalPrice}
                  </span>
                </div>

                {/* Button */}
                {/* SỬA LỖI LOGIC: Đổi 'href' thành 'to' và trỏ đến đúng route /du-lich/:slug/:id */}
                <Link
                  to={`/tours/${slugify(tour.title)}/${tour.id}`}
                  className="block"
                >
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
