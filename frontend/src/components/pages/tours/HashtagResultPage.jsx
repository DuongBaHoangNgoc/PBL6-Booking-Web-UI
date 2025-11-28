import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"; 
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import TourCard from "@/components/pages/tours/TourCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getToursByHashtagName } from "@/api/hashtags";

export default function HashtagResultPage() {
  const { hashtagName } = useParams(); // Lấy tên tag từ URL (ví dụ: "danang")
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalItems: 0,
  });

  // Hàm fetch data
  const fetchToursByTag = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit,
      };
      
      const data = await getToursByHashtagName(hashtagName, params);
      
      // API đã trả về { items: [tour1, tour2], totalItems: X }
      setTours(data.items || []);
      setPagination((prev) => ({
        ...prev,
        page,
        totalItems: data.totalItems || 0,
      }));
    } catch (err) {
      console.error("Lỗi khi tải tours theo hashtag:", err);
      setError("Không thể tải dữ liệu tour từ server.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect này sẽ chạy khi:
  // 1. Trang (page) thay đổi (bấm nút)
  // 2. Tên hashtag (từ URL) thay đổi
  useEffect(() => {
    fetchToursByTag(pagination.page);
  }, [hashtagName, pagination.page]);
  
  // useEffect này tự động RESET về trang 1
  // khi hashtag thay đổi
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  }, [hashtagName]);

  // (Hàm xử lý phân trang)
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-3xl md:text-4xl font-bold text-foreground mb-2">
            <Tag className="w-8 h-8 text-primary" />
            <span>#{hashtagName}</span>
          </div>
          <p className="text-muted-foreground">
            Kết quả tìm kiếm cho các tour được gắn thẻ #{hashtagName}
          </p>
        </div>

        {/* --- Hiển thị kết quả --- */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Tours Grid */}
        {!loading && !error && tours.length === 0 && (
          <p className="col-span-full text-center text-muted-foreground py-10">
            Không tìm thấy tour nào được gắn thẻ này.
          </p>
        )}

        {!loading && !error && tours.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tours.map((tour) => (
              <TourCard key={tour.tour.tourId} tour={tour.tour} />
            ))}
          </div>
        )}

        {/* JSX PHÂN TRANG */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center mt-16">
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
