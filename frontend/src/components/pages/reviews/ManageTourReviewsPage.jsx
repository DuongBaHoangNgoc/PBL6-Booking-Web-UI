import { useEffect, useMemo, useState } from "react";
import {
  Trash2,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hook/useDebounce";
import { useAuth } from "@/context/useAuth";

// ✅ tours api
import { filterTours } from "@/api/tours";

// ✅ reviews api
import { getReviewsFilterPagination, deleteReview } from "@/api/reviews";

const formatStar = (v) => {
  const n = Number(v || 0);
  if (!Number.isFinite(n)) return "0.0";
  return n.toFixed(1);
};

const StarsView = ({ value }) => {
  const v = Math.max(0, Math.min(5, Number(value || 0)));
  const full = Math.round(v);
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold">{formatStar(v)}</span>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < full
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export function ManageTourReviewsPage() {
  const { user } = useAuth();

  // ---------------- tours list ----------------
  const [tours, setTours] = useState([]);
  const [loadingTours, setLoadingTours] = useState(true);
  const [errorTours, setErrorTours] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  // filters giống ManageToursPage
  const [localFilters, setLocalFilters] = useState({
    slug: "",
    destination: "",
    status: "all",
  });
  const debouncedFilters = useDebounce(localFilters, 500);

  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const fetchTours = async (
    page = pagination.page,
    currentFilters = debouncedFilters
  ) => {
    try {
      setLoadingTours(true);
      setErrorTours(null);

      const params = {
        page,
        limit: pagination.limit,
        slug: currentFilters.slug || undefined,
        destination: currentFilters.destination || undefined,
        status:
          currentFilters.status !== "all" ? currentFilters.status : undefined,
        userId: user?.role === "supplier" ? user.userId : undefined,
      };

      const data = await filterTours(params);

      setTours(data.items || []);
      setPagination((prev) => ({
        ...prev,
        page,
        totalItems: data.totalItems || 0,
      }));
    } catch (err) {
      console.error("Failed to fetch tours:", err);
      setErrorTours("Không thể tải danh sách tour. Vui lòng thử lại.");
    } finally {
      setLoadingTours(false);
    }
  };

  useEffect(() => {
    fetchTours(pagination.page, debouncedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, debouncedFilters]);

  useEffect(() => {
    // đổi filter => về trang 1
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedFilters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // ---------------- reviews dialog ----------------
  const [openReviews, setOpenReviews] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [errorReviews, setErrorReviews] = useState(null);

  const [reviewPagination, setReviewPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  const reviewTotalPages = useMemo(() => {
    return Math.ceil(reviewPagination.totalItems / reviewPagination.limit);
  }, [reviewPagination.totalItems, reviewPagination.limit]);

  const fetchReviewsByTour = async (tourId, page = 1) => {
    try {
      setLoadingReviews(true);
      setErrorReviews(null);

      const res = await getReviewsFilterPagination({
        page,
        limit: reviewPagination.limit,
        tourId,
      });

      const data = res?.data ?? res;

      const items =
        data?.items ||
        data?.reviews ||
        data?.ReviewData ||
        data?.data?.items ||
        data?.data?.reviews ||
        [];

      const total =
        data?.totalItems ??
        data?.total ??
        data?.count ??
        data?.countReview ??
        data?.totalReviews ??
        data?.data?.totalItems ??
        data?.data?.total ??
        0;

      setReviews(Array.isArray(items) ? items : []);
      setReviewPagination((prev) => ({
        ...prev,
        page,
        totalItems: Number(total) || 0,
      }));
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      setErrorReviews(
        err?.response?.data?.message || "Không thể tải review của tour này."
      );
      setReviews([]);
      setReviewPagination((prev) => ({ ...prev, page: 1, totalItems: 0 }));
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleOpenTourReviews = (tour) => {
    setSelectedTour(tour);
    setOpenReviews(true);

    setReviews([]);
    setErrorReviews(null);

    setReviewPagination((prev) => ({ ...prev, page: 1, totalItems: 0 }));

    // ✅ quan trọng: tour.tourId có tồn tại không?
    console.log("[OPEN TOUR]", tour);
    fetchReviewsByTour(tour.tourId, 1);
  };

  const handleCloseReviews = () => {
    setOpenReviews(false);
    setSelectedTour(null);
    setReviews([]);
    setErrorReviews(null);
    setLoadingReviews(false);
    setReviewPagination((prev) => ({ ...prev, page: 1, totalItems: 0 }));
  };

  const handleDeleteReview = async (reviewId) => {
    if (!reviewId) return;
    if (!confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await deleteReview(reviewId);

      // ✅ Update UI ngay
      setReviews((prev) =>
        prev.filter((r) => (r.reviewId ?? r.id) !== reviewId)
      );

      // ✅ Update tổng số review
      setReviewPagination((prev) => ({
        ...prev,
        totalItems: Math.max(0, (prev.totalItems || 0) - 1),
      }));

      // ✅ Update reviewCount của tour ngay trên list
      if (selectedTour?.tourId) {
        setTours((prev) =>
          prev.map((t) =>
            t.tourId === selectedTour.tourId
              ? {
                  ...t,
                  reviewCount: Math.max(0, Number(t.reviewCount || 0) - 1),
                }
              : t
          )
        );
        setSelectedTour((prev) =>
          prev
            ? {
                ...prev,
                reviewCount: Math.max(0, Number(prev.reviewCount || 0) - 1),
              }
            : prev
        );
      }

      alert("✅ Đã xóa đánh giá!");
    } catch (err) {
      console.error("Delete review error:", err);
      alert(err?.response?.data?.message || "❌ Xóa đánh giá thất bại!");
    }
  };

  const formatDateTime = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("vi-VN");
    } catch {
      return "—";
    }
  };

  return (
    <div className="p-2 md:p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Quản lý Review Tour
        </h1>
        <div className="text-sm text-muted-foreground">
          Tổng tour:{" "}
          <span className="font-semibold">{pagination.totalItems}</span>
        </div>
      </div>

      {/* Bộ lọc */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bộ lọc Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Tên tour / slug</Label>
              <Input
                id="slug"
                placeholder="Tìm theo tên..."
                value={localFilters.slug}
                onChange={(e) => handleFilterChange("slug", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Điểm đến</Label>
              <Input
                id="destination"
                placeholder="Tìm theo điểm đến..."
                value={localFilters.destination}
                onChange={(e) =>
                  handleFilterChange("destination", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={localFilters.status}
                onValueChange={(v) => handleFilterChange("status", v)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* trạng thái tours */}
      {loadingTours && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {!loadingTours && errorTours && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorTours}</AlertDescription>
        </Alert>
      )}

      {!loadingTours && !errorTours && tours.length === 0 && (
        <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
          Chưa có tour nào.
        </div>
      )}

      {/* ✅ TABLE TOURS (đúng) */}
      {!loadingTours && !errorTours && tours.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ảnh</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Điểm đến</TableHead>
                <TableHead className="text-center">Số đánh giá</TableHead>
                <TableHead>Sao trung bình</TableHead>
                <TableHead className="text-right">Xem</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {tours.map((tour) => (
                <TableRow
                  key={tour.tourId}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleOpenTourReviews(tour)}
                  title="Click để xem toàn bộ đánh giá"
                >
                  <TableCell>
                    <img
                      src={
                        tour.image ||
                        "https://placehold.co/100x70/0D9488/FFFFFF?text=Tour"
                      }
                      alt={tour.title}
                      className="w-20 h-14 object-cover rounded-md"
                    />
                  </TableCell>

                  <TableCell>
                    <div className="font-medium">{tour.title}</div>
                    <div className="text-sm text-muted-foreground">
                      ID: {tour.tourId} • {tour.slug}
                    </div>
                  </TableCell>

                  <TableCell>{tour.destination || "—"}</TableCell>

                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {Number(tour.reviewCount || 0)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <StarsView value={tour.starAvg || 0} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenTourReviews(tour);
                      }}
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* phân trang tours */}
      {!loadingTours && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
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
            disabled={pagination.page >= totalPages}
          >
            Trang sau
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* ✅ DIALOG REVIEWS (có thùng rác) */}
      <Dialog
        open={openReviews}
        onOpenChange={(v) => {
          if (!v) handleCloseReviews();
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              Đánh giá tour: {selectedTour?.title || ""}
            </DialogTitle>
            <DialogDescription>
              Điểm đến: {selectedTour?.destination || "—"} • Review:{" "}
              {Number(selectedTour?.reviewCount || 0)} • Sao TB:{" "}
              {formatStar(selectedTour?.starAvg || 0)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {loadingReviews && (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            {!loadingReviews && errorReviews && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorReviews}</AlertDescription>
              </Alert>
            )}

            {!loadingReviews && !errorReviews && reviews.length === 0 && (
              <div className="text-center text-muted-foreground py-10">
                Tour này chưa có đánh giá.
              </div>
            )}

            {!loadingReviews && !errorReviews && reviews.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người đánh giá</TableHead>
                      <TableHead>Số sao</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead className="text-right">Xóa</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {reviews.map((rv, idx) => {
                      const reviewId = rv.reviewId ?? rv.id; // ✅ id để xóa
                      return (
                        <TableRow key={reviewId ?? idx}>
                          <TableCell>
                            <div className="font-medium">
                              {rv.user?.fullName || rv.fullName || "—"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {rv.user?.email || rv.email || "—"}
                            </div>
                          </TableCell>

                          <TableCell>
                            <StarsView value={rv.rating ?? rv.star ?? 0} />
                          </TableCell>

                          <TableCell>
                            <div className="max-w-[520px] whitespace-pre-wrap">
                              {rv.comment || "—"}
                            </div>
                          </TableCell>

                          <TableCell className="text-muted-foreground">
                            {formatDateTime(rv.timestamp)}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDeleteReview(reviewId)}
                              disabled={!reviewId}
                              title="Xóa đánh giá"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loadingReviews && reviewTotalPages > 1 && (
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  disabled={reviewPagination.page === 1}
                  onClick={() =>
                    fetchReviewsByTour(
                      selectedTour?.tourId,
                      reviewPagination.page - 1
                    )
                  }
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Trang trước
                </Button>

                <span className="text-sm text-muted-foreground">
                  Trang {reviewPagination.page} / {reviewTotalPages}
                </span>

                <Button
                  variant="outline"
                  disabled={reviewPagination.page >= reviewTotalPages}
                  onClick={() =>
                    fetchReviewsByTour(
                      selectedTour?.tourId,
                      reviewPagination.page + 1
                    )
                  }
                >
                  Trang sau
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseReviews}>
                Đóng
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
