import { useEffect, useState, useMemo } from "react";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import TourCard from "@/components/TourCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDebounce } from "@/hook/useDebounce"; 
import { Alert, AlertDescription } from "@/components/ui/alert"; 
import { filterTours, getTourPriceById } from "@/api/tours";


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

  //State cho phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalItems: 0,
  });

  // State cho phân
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
      }
      const toursData = await filterTours(params);

      // 3️⃣ Ghép dữ liệu 2 bảng theo id
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
      }))
    } catch (err) {
      console.error("Lỗi khi tải tours:", err);
      setError("Không thể tải dữ liệu từ server.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTours();
  }, [debouncedSlug, pagination.page]);

  useEffect(() => {
    // Chỉ reset trang nếu page hiện tại không phải là 1
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [debouncedSlug]);

  // 3. THÊM HÀM: Xử lý bấm nút phân trang
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // (Hàm handler cho input filter)
  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

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
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </section>
    );

  // 5. SỬA LỖI LOGIC LỌC (CLIENT-SIDE)
  const filteredTours = tours
    .filter((tour) => {
      if (selectedCategory === "All") return true;
      return tour.category === selectedCategory;
    })
    .filter((tour) => {
      if (!debouncedSlug) return true; 
      return tour.title.toLowerCase().includes(debouncedSlug.toLowerCase());
    });

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
            OUR TOUR PACKAGES
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          
          {/* Item 1: Categories (tự wrap) */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                // Kết nối logic state
                onClick={() => setSelectedCategory(cat)} 
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  // Kết nối logic state
                  selectedCategory === cat 
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border text-foreground hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Item 2: Search + Sort (nhóm lại) */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            
            {/* Search Input (kết nối logic) */}
            <div>
              <Label htmlFor="slug" className="sr-only">Tìm theo Tên Tour</Label>
              <Input
                id="slug"
                placeholder="Nhập tên tour..."
                value={localFilters.slug} 
                onChange={(e) => handleFilterChange("slug", e.target.value)}
                className="w-auto" 
              />
            </div>
            
            {/* Sort Select (kết nối logic) */}
            <div className="flex items-center">
              <Select
                value={sortBy} 
                onValueChange={(value) => setSortBy(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Phổ biến nhất</SelectItem>
                  <SelectItem value="price-low">Giá: Thấp đến Cao</SelectItem>
                  <SelectItem value="price-high">Giá: Cao đến Thấp</SelectItem>
                  <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
                </SelectContent>
              </Select>
              <Filter className="w-4 h-4 text-muted-foreground items-center mx-2" />
            </div>
          </div>
        </div>

        {/* Tours Grid */}
        {loading && (
            <div className="text-center text-muted-foreground py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            </div>
          )}
          
          {!loading && sortedTours.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedTours.map((tour) => (
                <TourCard key={tour.tourId} tour={tour} />
              ))}
            </div>
          )}
          
          {!loading && sortedTours.length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-10">
              Không có tour nào khớp với tìm kiếm của bạn.
            </p>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex justify-between mt-16">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Trang trước
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {pagination.page} trên {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= totalPages || loading}
              >
                Trang sau
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
      </div>
    </section>
  );
}
