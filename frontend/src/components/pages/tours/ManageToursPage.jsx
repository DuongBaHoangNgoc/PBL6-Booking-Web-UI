import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { filterToursBySlug, deleteTour, filterTours, updateTour } from "@/api/tours";
import { CreateTourWizard } from "./CreateTourWizard";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hook/useDebounce";
const getStatusBadge = (status) => {
  if (status === 'active') {
    return <Badge variant="default" className="bg-green-600">Active</Badge>;
  }
  if (status === 'pending') {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (status === 'inactive') {
    return <Badge variant="destructive">Inactive</Badge>;
  }
  return <Badge variant="outline">{status || "N/A"}</Badge>;
};

export function ManageToursPage() {
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  
  // State cho phân trang
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  // State cho Filter
  const [localFilters, setLocalFilters] = useState({
    slug: "",
    destination: "",
    status: "all",
  });

  const debouncedFilters = useDebounce(localFilters, 500);

  // State cho Dialog
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, tourId: null });

  // Hàm gọi API chính
  const fetchTours = async (page = pagination.page, currentFilters = debouncedFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { 
        page, 
        limit: pagination.limit, 
        slug: currentFilters.slug || undefined, 
        destination: currentFilters.destination || undefined, 
        status: currentFilters.status !== "all" ? currentFilters.status : undefined 
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
      setError("Không thể tải danh sách tour. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Tự động gọi API khi trang thay đổi
  useEffect(() => {
    fetchTours(pagination.page, debouncedFilters);
  }, [pagination.page, debouncedFilters]);

  // useEffect này tự động RESET về trang 1
  // BẤT CỨ KHI NÀO người dùng thay đổi bộ lọc
  useEffect(() => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, [debouncedFilters]);

  // Hàm xử lý thay đổi filter cục bộ
  const handleFilterChange = (field, value) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý phân trang
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  // Xử lý Xóa
  const openDeleteDialog = (tourId) => {
    setDeleteDialog({ isOpen: true, tourId });
  };

  const handleDeleteTour = async () => {
    try {
      await deleteTour(deleteDialog.tourId);
      setDeleteDialog({ isOpen: false, tourId: null });
      fetchTours(1, debouncedFilters); // Tải lại danh sách về trang 1
    } catch (err) {
      console.error("Failed to delete tour:", err);
      alert("Xóa tour thất bại.");
      setDeleteDialog({ isOpen: false, tourId: null });
    }
  };

  const handleEditTour = (tourId) => {
    navigate(`/admin/tours/edit/${tourId}`);
  };

  const handleStatusChange = async (tourId, newStatus, currentStatus) => {
    if (newStatus === currentStatus) return;

    setTours((prevTours) =>
      prevTours.map((tour) =>
        tour.tourId === tourId ? { ...tour, status: newStatus } : tour
      )
    );

    try {
      await updateTour(tourId, { status: newStatus });
    } catch (error) { 
      console.error("Lỗi khi cập nhật trạng thái tour:", error);
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.tourId === tourId ? { ...tour, status: currentStatus } : tour
        )
      );
    }
  }

  return (
    <div className="p-6 md:p-14">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Quản lý Tour</h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Tạo Tour Mới
        </Button>
      </div>

      {/* 6. THÊM JSX CHO BỘ LỌC */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Bộ lọc Tour</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slug">Tên Tour (hoặc slug)</Label>
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
                onChange={(e) => handleFilterChange("destination", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select
                value={localFilters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Lọc theo Trạng thái" />
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

      {/* --- Bảng Dữ liệu --- */}
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

      {!loading && !error && tours.length === 0 && (
        <div className="text-center text-muted-foreground h-64 flex items-center justify-center">
          Chưa có tour nào.
        </div>
      )}

      {!loading && !error && tours.length > 0 && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Ảnh</TableHead>
                <TableHead>Tour</TableHead>
                <TableHead>Điểm đến</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Số lượng</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((tour) => (
                <TableRow key={tour.tourId}>
                  <TableCell>
                    <img
                      src={tour.image || "https://placehold.co/100x70/0D9488/FFFFFF?text=Tour"}
                      alt={tour.title}
                      className="w-20 h-14 object-cover rounded-md"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tour.title}</div>
                    <div className="text-sm text-muted-foreground">ID: {tour.tourId}</div>
                  </TableCell>
                  <TableCell>{tour.destination}</TableCell>
                  <TableCell>
                    <Select
                      value={tour.status || 'pending'}
                      onValueChange={(newStatus) => 
                        handleStatusChange(tour.tourId, newStatus, tour.status)
                      }
                    >
                      <SelectTrigger className={`w-[120px] font-medium ${getStatusBadge(tour.status)}`}>
                        <SelectValue placeholder="Chọn..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  
                  <TableCell>{tour.quantity}</TableCell>
                  <TableCell>{tour.time || "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditTour(tour.tourId)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Sửa Tour (Chỉnh sửa chi tiết)
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => openDeleteDialog(tour.tourId)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Xóa Tour
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* --- Phân trang --- */}
      {!loading && totalPages > 1 && (
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

      {/* --- Dialog Tạo Mới --- */}
      {/* Đây là component xử lý logic 3 bước
        Nó được import từ file kế tiếp (CreateTourWizard.jsx)
      */}
      <CreateTourWizard
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => {
          setIsCreateOpen(false);
          fetchTours(1); // Tải lại danh sách
        }}
      />

      {/* --- Dialog Xóa --- */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog({ ...deleteDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tour này sẽ bị xóa vĩnh viễn.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteTour}
            >
              Xác nhận Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

