import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Map,
} from "lucide-react";
import TourCard from "@/components/pages/tours/TourCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebounce } from "@/hook/useDebounce";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { filterTours, getTourPriceById } from "@/api/tours";

const categories = [
  "All",
  "Đà Nẵng",
  "Đà Lạt",
  "Tây Ninh",
  "Hà Giang"
];

export default function TourSearchResult() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular");

  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, // Số tour mỗi trang
    totalItems: 0,
  });

  // State cho bộ lọc local
  const [localFilters, setLocalFilters] = useState({
    slug: "",
    destination: "",
    status: "all",
  });

  const debouncedSlug = useDebounce(localFilters.slug, 500);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        slug: debouncedSlug || undefined,
        status: 'active'
      };
      const toursData = await filterTours(params);

      // Ghép dữ liệu giá
      const merged = await Promise.all(
        toursData?.items.map(async (tour) => {
          const priceData = await getTourPriceById(tour.tourId);
          const minPriceAdult = Number(priceData.minPriceAdult) || 0;
          const maxPriceAdult = Number(priceData.maxPriceAdult) || 0;
          return {
            ...tour,
            price: minPriceAdult,
            originalPrice: maxPriceAdult,
          };
        })
      );
      setTours(merged);
      setPagination((prev) => ({
        ...prev,
        totalItems: toursData.totalItems || 0,
      }));
    } catch (err) {
      console.error("Lỗi khi tải tours:", err);
      setError("Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [debouncedSlug, pagination.page]);

  useEffect(() => {
    // Reset về trang 1 khi thay đổi từ khóa tìm kiếm
    if (pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  }, [debouncedSlug]);

  // Tính tổng số trang
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
      // Scroll lên đầu grid khi chuyển trang
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Lọc Client-side (Category & Slug bổ sung nếu cần)
  const filteredTours = tours
    .filter((tour) => {
      if (selectedCategory === "All") return true;
      return tour.destination === selectedCategory;
    })
    .filter((tour) => {
      // Lưu ý: Slug đã được lọc ở server, đây là lọc phụ client nếu cần
      if (!debouncedSlug) return true;
      return tour.title.toLowerCase().includes(debouncedSlug.toLowerCase());
    });

  // Sắp xếp
  const sortedTours = [...filteredTours].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.starAvg - a.starAvg;
    return 0; // Default: popular/server order
  });

  return (
    <section className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">

        {/* ================= HEADER SECTION ================= */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 text-sm font-semibold mb-4">
            <Map className="w-4 h-4" /> Explore The World
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Dream Tour</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Browse through our extensive collection of tours and find the perfect package for your next adventure.
          </p>
        </div>

        {/* ================= CONTROLS (FILTER & SEARCH) ================= */}
        <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl shadow-cyan-900/5 border border-slate-100 mb-10 sticky top-24 z-30">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-center">

            {/* 1. Category Pills */}
            <div className="w-full xl:w-auto overflow-x-auto overflow-y-hidden pb-2 xl:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 min-w-max p-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${selectedCategory === cat
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-cyan-500/30 transform scale-105"
                      : "bg-slate-50 text-slate-600 hover:bg-white hover:text-cyan-600 hover:shadow-md border border-transparent hover:border-cyan-100"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Search & Sort Actions */}
            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">

              {/* Search Box */}
              <div className="relative w-full sm:w-72 group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-500 transition-colors">
                  <Search className="w-4 h-4" />
                </div>
                <Input
                  id="slug"
                  placeholder="Search tours..."
                  value={localFilters.slug}
                  onChange={(e) => handleFilterChange("slug", e.target.value)}
                  className="pl-10 h-11 bg-slate-50 border-slate-200 focus:border-cyan-500 focus:ring-cyan-500 rounded-xl transition-all"
                />
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl bg-white border-slate-200 focus:ring-cyan-500 text-slate-700 font-medium hover:border-cyan-300 transition-colors">
                    <Filter className="w-4 h-4 mr-2 text-cyan-500" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT GRID ================= */}
        {error ? (
          <div className="max-w-lg mx-auto py-10">
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        ) : loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-cyan-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Finding the best tours for you...</p>
          </div>
        ) : sortedTours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedTours.map((tour) => (
              <div key={tour.tourId} className="animate-in fade-in zoom-in-95 duration-500">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No tours found</h3>
            <p className="text-slate-500 max-w-md">
              We couldn't find any tours matching your search "{localFilters.slug}". Try adjusting your filters or search keywords.
            </p>
            <Button
              variant="outline"
              className="mt-6 border-cyan-200 text-cyan-600 hover:bg-cyan-50"
              onClick={() => {
                setLocalFilters({ slug: "", destination: "", status: "all" });
                setSelectedCategory("All");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* ================= PAGINATION ================= */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-16">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="h-10 px-4 rounded-full border-slate-200 hover:border-cyan-500 hover:text-cyan-600 hover:bg-white disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Page</span>
              <span className="px-3 py-1 bg-white border border-cyan-200 rounded-lg text-cyan-600 font-bold min-w-[2rem] text-center shadow-sm">
                {pagination.page}
              </span>
              <span className="text-sm font-medium text-slate-500">of {totalPages}</span>
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="h-10 px-4 rounded-full border-slate-200 hover:border-cyan-500 hover:text-cyan-600 hover:bg-white disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}