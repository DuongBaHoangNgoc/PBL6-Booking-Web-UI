import { Search, Calendar, ChevronDown, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink } from "@/components/ui/pagination";
import { useAuth } from "@/context/useAuth";
import { useEffect, useState } from "react";
import { filterBookingBySupplierId } from "@/api/bookings";

const formatDateRange = (isoStart, isoEnd) => {
  if (!isoStart || !isoEnd) return ""

  const start = new Date(isoStart)
  const end = new Date(isoEnd)

  const startDay = start.getDate()
  const endDay = end.getDate()
  const startMonth = start.getMonth()
  const endMonth = end.getMonth()
  const startYear = start.getFullYear()
  const endYear = end.getFullYear()

  // Định dạng cho tháng (VD: "Thg 11")
  const monthFormat = { month: "short" }
  const startMonthStr = start.toLocaleDateString("vi-VN", monthFormat)
  const endMonthStr = end.toLocaleDateString("vi-VN", monthFormat)

  if (startYear !== endYear) {
    // VD: 30 Thg 12, 2025 - 05 Thg 1, 2026
    return `${startDay} ${startMonthStr}, ${startYear} - ${endDay} ${endMonthStr}, ${endYear}`
  }
  
  if (startMonth !== endMonth) {
    // VD: 12 Thg 11 - 05 Thg 12, 2025
    return `${startDay} ${startMonthStr} - ${endDay} ${endMonthStr}, ${startYear}`
  }
  
  // VD: 12 - 17 Thg 11, 2025
  return `${startDay} - ${endDay} ${startMonthStr}, ${startYear}`
}

const getDuration = (isoStart, isoEnd) => {
  if (!isoStart || !isoEnd) return ""
  
  const start = new Date(isoStart)
  const end = new Date(isoEnd)
  
  // Tính toán sự chênh lệch (ms) và chuyển sang ngày
  const diffTime = Math.abs(end.getTime() - start.getTime())
  // Dùng Math.round để xử lý chênh lệch múi giờ (DST)
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  const totalNights = diffDays
  const totalDays = totalNights + 1
  
  return `${totalDays} ngày / ${totalNights} đêm`
}

function StatusBadge({ status }) {
  const colors = {
    confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-200",
    pending: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-200",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        colors[status]
      }`}
    >
      {status}
    </span>
  );
}

// Component Bảng Bookings (mã nguồn của bạn)
export function BookingsTable() {
  const { user } = useAuth();
  console.log("XP-DEBUG-Current-user: ", user);
  const [ bookingsData, setBookingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  const fetchBookings = async (page = pagination.page) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: pagination.limit,
        supplierId: user.userId,
      }
      const data = await filterBookingBySupplierId(params);
      console.log("data: ", data);
      setBookingsData(data.items || []);
      console.log("XP-DEBUG-DataItem: ", data.items);
      setPagination((prev) => ({
        ...prev,
        page,
        totalItems: data.totalItems || 0,
      }));
    } catch (err) {
      console.log("Failed to fetch bookings by supplier id", err);
      setError("Khong the tai danh sach booking. Vui long thu lai.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBookings(pagination.page);
  }, [pagination.page]);

  return (
    <Card className="m-6">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search name, package, etc"
                className="w-full pl-10 pr-4 py-2 bg-muted rounded-lg border border-input focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Today
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Today</DropdownMenuItem>
                <DropdownMenuItem>This Week</DropdownMenuItem>
                <DropdownMenuItem>This Month</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Button className="bg-blue-500 hover:bg-blue-600 gap-2">
            <Plus className="w-4 h-4" />
            Add Booking
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted">
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Tên khách hàng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Mã đặt chỗ</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Gói tour</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Thời lượng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Ngày đi</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-muted-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {bookingsData.map((booking) => (
                <tr key={booking.bookingId} className="border-b hover:bg-muted/50 transition">
                  <td className="px-6 py-4 text-sm">{booking.fullName}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{booking.bookingId}</td>
                  <td className="px-6 py-4 text-sm">{booking.tour.title}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{getDuration(booking.date.startDate, booking.date.endDate)}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{formatDateRange(booking.date.startDate, booking.date.endDate)}</td>
                  <td className="px-6 py-4 text-sm font-semibold">{Number(booking.totalPrice).toLocaleString('vi-VN', {style: 'currency', currency: 'VND',})}</td>
                  <td className="px-6 py-4 text-sm">
                    <StatusBadge status={booking.bookingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-6 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">...</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">16</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  )
}