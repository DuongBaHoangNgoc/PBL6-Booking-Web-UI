import { useEffect, useState } from "react";
import { Filter } from "lucide-react";
import TourCard from "@/components/TourCard";

const categories = [
  "All",
  "Beach",
  "Culture",
  "Adventure",
  "Romance",
  "City",
  "Luxury",
];

export default function TourSearchResult() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  // 🆕 Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // số tour mỗi trang
  const [totalPages, setTotalPages] = useState(1);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function fetchTours() {
      try {
        setLoading(true);
        setError(null);

        // ✅ Gọi API có phân trang
        const res = await fetch(
          `${API_URL}/tours/GetAllPagination?page=${page}&limit=${limit}`
        );
        if (!res.ok) throw new Error(`Lỗi ${res.status}: ${res.statusText}`);

        const data = await res.json();
        const tourList = data.data?.tours || data.data || [];
        const total = data.data?.totalPages || data.totalPages || 1;
        setTotalPages(total);

        // ✅ Lấy giá cho từng tour
        const merged = await Promise.all(
          tourList.map(async (tour) => {
            const resPrice = await fetch(
              `${API_URL}/start-end-dates/priceTour/${tour.tourId}`
            );
            const priceData = await resPrice.json();
            const minPriceAdult = Number(priceData.data?.minPriceAdult) || 0;
            const maxPriceAdult = Number(priceData.data?.maxPriceAdult) || 0;
            return {
              ...tour,
              price: minPriceAdult,
              originalPrice: maxPriceAdult,
            };
          })
        );

        setTours(merged);
      } catch (err) {
        console.error("Lỗi khi tải tours:", err);
        setError("Không thể tải dữ liệu từ server.");
      } finally {
        setLoading(false);
      }
    }

    fetchTours();
  }, [API_URL, page, limit]);

  // Loading UI
  if (loading)
    return (
      <section className="p-6 md:p-14">
        <div className="text-center text-muted-foreground py-20">
          Đang tải danh sách tour...
        </div>
      </section>
    );

  // Error UI
  if (error)
    return (
      <section className="p-6 md:p-14">
        <div className="text-center text-red-500 py-20">{error}</div>
      </section>
    );

  // Lọc & sắp xếp
  const filteredTours =
    selectedCategory === "All"
      ? tours
      : tours.filter((t) => t.category === selectedCategory);

  const sortedTours = [...filteredTours].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.starAvg - a.starAvg;
    return 0;
  });

  return (
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Explore Tours
          </h1>
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
          {sortedTours.length > 0 ? (
            sortedTours.map((tour) => (
              <TourCard key={tour.tourId} tour={tour} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground py-10">
              Không có tour nào trong danh mục này.
            </p>
          )}
        </div>

        {/* 🧭 Pagination */}
        <div className="flex justify-center items-center mt-10 gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-primary/10"
          >
            ← Previous
          </button>

          <span className="px-3 py-2">
            Trang <strong>{page}</strong> / {totalPages}
          </span>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-primary/10"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  );
}
