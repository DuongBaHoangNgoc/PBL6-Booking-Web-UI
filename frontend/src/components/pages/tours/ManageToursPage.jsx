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
  XCircle,
  Send,
  BellRing,
  CalendarDays,
  Users,
  Mail,
  Phone,
} from "lucide-react";
import { format } from "date-fns";
import { deleteTour, filterTours, updateTour, getStartDatesByTourId } from "@/api/tours";
import { getBookingsByDateId } from '@/api/bookings';
import { CreateTourWizard } from "./CreateTourWizard";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useDebounce } from "@/hook/useDebounce";
import { useAuth } from "@/context/useAuth";
import { Alert } from "@/components/ui/alert";
import { AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State lưu tổng số tour đang chờ duyệt trên TOÀN hệ thống
  const [totalPendingCount, setTotalPendingCount] = useState(0);

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

  // State cho Lớp 1: Ngày khởi hành
  const [selectedTour, setSelectedTour] = useState(null);
  const [tourDates, setTourDates] = useState([]);
  const [loadingDates, setLoadingDates] = useState(false);

  // State cho Lớp 2: Danh sách khách hàng
  const [selectedDate, setSelectedDate] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  const handleViewDates = async (tour) => {
    setSelectedTour(tour);
    setLoadingDates(true);
    const dates = await getStartDatesByTourId(tour.tourId);
    setTourDates(dates);
    setLoadingDates(false);
  };

  const handleViewParticipants = async (date) => {
    setSelectedDate(date);
    setLoadingParticipants(true);
    const bookings = await getBookingsByDateId(date.dateId);
    setParticipants(bookings);
    setLoadingParticipants(false);
  };

  const fetchTotalPendingCount = async () => {
    if (!isAdmin) return;
    try {
      const data = await filterTours({ status: 'pending', limit: 1, page: 1 });
      setTotalPendingCount(data.totalItems || 0);
    } catch (err) {
      console.error("Lỗi khi lấy tổng số tour pending:", err);
    }
  };

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
        status: currentFilters.status !== "all" ? currentFilters.status : undefined,
        userId: user.role === 'supplier' ? user.userId : undefined,
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
    if (isAdmin) fetchTotalPendingCount();
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
      if (isAdmin) fetchTotalPendingCount();
    } catch (err) {
      console.error("Failed to delete tour:", err);
      alert("Xóa tour thất bại.");
      setDeleteDialog({ isOpen: false, tourId: null });
    }
  };

  const handleEditTour = (tourId) => {
    if (user.role === "admin") {
      navigate(`/admin/tours/edit/${tourId}`);
    } else {
      navigate(`/supplier/tours/edit/${tourId}`);
    }
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
      if (isAdmin) fetchTotalPendingCount();
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái tour:", error);
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.tourId === tourId ? { ...tour, status: currentStatus } : tour
        )
      );
    }
  }

  const handleQuickFilterPending = () => {
    const newFilters = { ...localFilters, status: 'pending' };
    setLocalFilters(newFilters);
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="p-2 md:p-6 bg-white rounded-lg">
      <style>{`
        html { scrollbar-gutter: stable !important; }
        body[data-scroll-locked] { padding-right: 0px !important; margin-right: 0px !important; overflow-y: scroll !important; }
      `}</style>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">Quản lý Tour</h1>
        <Button className="bg-blue-600" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Tạo Tour Mới
        </Button>
      </div>

      {/* THONG BAO CHO ADMIN KHI CO REQUEST MOI */}
      {isAdmin && totalPendingCount > 0 && localFilters.status !== 'pending' && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 animate-in fade-in slide-in-from-top-4 duration-500">
          <BellRing className="h-5 w-5 text-yellow-600" />
          <AlertDescription className="text-yellow-800 flex items-center justify-between w-full">
            <span>
              Bạn có <strong>{totalPendingCount}</strong> yêu cầu phê duyệt tour mới đang chờ xử lý.
            </span>
            <Button
              variant="link"
              size="sm"
              className="text-yellow-900 font-bold underline p-0 h-auto"
              onClick={handleQuickFilterPending}
            >
              Xem ngay
            </Button>
          </AlertDescription>
        </Alert>
      )}

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
                <TableHead>Quản lý lịch</TableHead>
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
                    {isAdmin ? (
                      // === ADMIN VIEW: Đầy đủ quyền lực ===
                      <Select
                        value={tour.status || 'pending'}
                        onValueChange={(newStatus) => handleStatusChange(tour.tourId, newStatus)}
                      >
                        <SelectTrigger className="w-[130px]">
                          {getStatusBadge(tour.status)}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      // === SUPPLIER VIEW: Quyền hạn chế ===
                      <div className="flex items-center gap-2">
                        {getStatusBadge(tour.status)}

                        {tour.status === 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                            onClick={() => handleStatusChange(tour.tourId, 'pending')}
                            title="Gửi yêu cầu duyệt"
                          >
                            <Send className="w-3 h-3 mr-1" /> Gửi duyệt
                          </Button>
                        )}
                        {tour.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                            onClick={() => handleStatusChange(tour.tourId, 'inactive')}
                            title="Tạm ẩn tour này"
                          >
                            <XCircle className="w-3 h-3 mr-1" /> Ẩn tour
                          </Button>
                        )}
                        {tour.status === 'pending' && (
                          <span className="text-xs text-muted-foreground italic ml-2">
                            (Đang chờ duyệt)
                          </span>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 bg-blue-50" onClick={() => handleViewDates(tour)}>
                      <CalendarDays className="w-4 h-4 mr-2" /> Xem lịch đi
                    </Button>
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

      {/* 🚀 LỚP 1: DIALOG DANH SÁCH NGÀY KHỞI HÀNH (ĐÃ SỬA LỖI OVERFLOW) */}
      <Dialog open={!!selectedTour} onOpenChange={() => setSelectedTour(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <div className="p-6 border-b bg-white z-10">
            <DialogHeader>
              <DialogTitle className="text-blue-700 text-xl font-bold">Lịch khởi hành: {selectedTour?.title}</DialogTitle>
              <DialogDescription>Dưới đây là các đợt khởi hành của tour. Nhấn "Xem khách" để quản lý người dùng đăng ký.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-200">
            {loadingDates ? (
              <div className="flex flex-col items-center py-20 gap-2">
                <Loader2 className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500">Đang tải lịch trình...</span>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-20">
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Giá (Adult)</TableHead>
                    <TableHead>Chỗ ngồi</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tourDates.length > 0 ? tourDates.map(date => (
                    <TableRow key={date.dateId} className="hover:bg-slate-50">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="text-emerald-600 font-bold">{format(new Date(date.startDate), "dd/MM/yyyy")}</span>
                          <span className="text-[10px] text-muted-foreground italic">đến {format(new Date(date.endDate), "dd/MM/yyyy")}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-bold text-blue-800">
                        {Number(date.priceAdult || 0).toLocaleString()}đ
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex justify-between text-[9px] font-bold">
                            <span>Đã đặt: {date.quantity - date.availability}</span>
                            <span>{date.quantity}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden shadow-inner">
                            <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${((date.quantity - date.availability) / date.quantity) * 100}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="secondary" className="hover:bg-blue-600 hover:text-white transition-all shadow-sm" onClick={() => handleViewParticipants(date)}>
                          <Users className="w-3.5 h-3.5 mr-2" /> Xem khách
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Chưa có lịch khởi hành nào được thiết lập.</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* LỚP 2: DIALOG DANH SÁCH KHÁCH HÀNG (CŨNG ĐÃ SỬA OVERFLOW) */}
      <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
           <div className="p-6 border-b bg-white z-10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-teal-700 font-black text-xl italic uppercase tracking-tighter">
                <Users className="w-6 h-6" /> Khách hàng đăng ký ngày {selectedDate && format(new Date(selectedDate.startDate), "dd/MM/yyyy")}
              </DialogTitle>
              <DialogDescription>Danh sách chi tiết khách hàng và trạng thái đơn hàng.</DialogDescription>
            </DialogHeader>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            {loadingParticipants ? (
              <div className="flex flex-col items-center py-24 gap-4">
                <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang trích xuất dữ liệu khách...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <Card className="bg-teal-50/50 border-teal-100 p-5 shadow-sm rounded-2xl">
                    <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">Tổng số khách</p>
                    <p className="text-3xl font-black text-teal-900">{participants.reduce((s, p) => s + p.numAdults + p.numChildren, 0)} người</p>
                  </Card>
                  <Card className="bg-blue-50/50 border-blue-100 p-5 shadow-sm rounded-2xl">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Doanh thu dự kiến</p>
                    <p className="text-3xl font-black text-blue-900">{participants.reduce((s, p) => s + Number(p.totalPrice), 0).toLocaleString()}đ</p>
                  </Card>
                </div>

                <div className="border rounded-2xl overflow-hidden shadow-sm bg-white">
                  <Table>
                    <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm border-b">
                      <TableRow>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Họ tên khách</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Thông tin liên hệ</TableHead>
                        <TableHead className="font-bold uppercase text-[10px] tracking-widest">Phân loại</TableHead>
                        <TableHead className="text-right font-bold uppercase text-[10px] tracking-widest">Tổng tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {participants.length > 0 ? participants.map(p => (
                        <TableRow key={p.bookingId} className="hover:bg-slate-50/50">
                          <TableCell className="font-bold text-slate-700 uppercase italic tracking-tight">{p.fullName}</TableCell>
                          <TableCell>
                            <div className="text-[11px] text-muted-foreground space-y-1">
                              <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-blue-500" /> {p.email}</div>
                              <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-blue-500" /> {p.phoneNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-500">
                             <Badge variant="outline" className="text-[10px]">{p.numAdults}L, {p.numChildren}N</Badge>
                          </TableCell>
                          <TableCell className="text-right font-black text-teal-700">
                            {Number(p.totalPrice).toLocaleString()}đ
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} className="text-center py-20 text-muted-foreground italic">Chưa có khách hàng nào đặt chỗ cho đợt khởi hành này.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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

