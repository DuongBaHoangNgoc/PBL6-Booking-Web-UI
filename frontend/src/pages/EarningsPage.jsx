import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  CreditCard,
  Package,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
// 1. XÓA IMPORT API
// import { getEarningsStats, getEarningsChartData, getTransactions } from "@/api/earnings";
import { useAuth } from "@/context/useAuth";
// Format tiền tệ
const formatCurrency = (value) => {
  return `${(value / 1000).toLocaleString("vi-VN")}k ₫`;
};

// ===================================================================
// 2. (MỚI) DỮ LIỆU GIẢ LẬP (MOCK DATA)
// ===================================================================

// Dữ liệu cho Thẻ KPI
const mockStats = {
  totalRevenue: 125000000,
  currentPeriodRevenue: 15000000,
  paidBookings: 32,
  pendingPayout: 5000000,
};

// Dữ liệu cho Biểu đồ
const mockChartData = [
  { date: "11/01", revenue: 1200000 },
  { date: "11/02", revenue: 800000 },
  { date: "11/03", revenue: 2500000 },
  { date: "11/04", revenue: 1100000 },
  { date: "11/05", revenue: 3000000 },
  { date: "11/06", revenue: 1800000 },
  { date: "11/07", revenue: 2200000 },
];

// Dữ liệu cho Bảng Giao dịch (Giả lập 25 item, nhưng chỉ trả về 3)
const mockTransactions = {
  items: [
    {
      transactionId: "TRX1001",
      bookingId: 101,
      tourTitle: "Tour Du thuyền 5 sao Vịnh Hạ Long",
      amount: 2500000,
      paymentMethod: "VNPAY",
      status: "SUCCESS",
      createdAt: "2025-11-10T10:00:00Z",
    },
    {
      transactionId: "TRX1002",
      bookingId: 102,
      tourTitle: "Khám phá Phố cổ Hội An & Đà Nẵng",
      amount: 3200000,
      paymentMethod: "MOMO",
      status: "SUCCESS",
      createdAt: "2025-11-09T14:30:00Z",
    },
    {
      transactionId: "TRX1003",
      bookingId: 103,
      tourTitle: "Chinh phục Cung đường Hà Giang",
      amount: 4500000,
      paymentMethod: "CASH",
      status: "PENDING",
      createdAt: "2025-11-09T09:15:00Z",
    },
  ],
  totalItems: 25, // Giả lập 25 item để hiển thị phân trang
};
// ===================================================================
// (Kết thúc Mock Data)
// ===================================================================

export function EarningsPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState("30day"); // Mặc định 30 ngày

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
  });

  // 3. CẬP NHẬT HÀM FETCH (DÙNG MOCK DATA)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // (Xóa các lệnh gọi API thật)

      // Giả lập độ trễ mạng
      await new Promise((resolve) => setTimeout(resolve, 800));

      // (Kiểm tra nếu params thay đổi, ta có thể trả về data khác,
      // nhưng hiện tại chỉ cần trả về 1 bộ mock)

      setStats(mockStats);
      setChartData(mockChartData);
      setTransactions(mockTransactions.items);
      setPagination((prev) => ({
        ...prev,
        totalItems: mockTransactions.totalItems,
      }));
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu Doanh thu:", err);
      setError("Không thể tải dữ liệu thống kê từ server.");
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu khi 'dateRange' hoặc 'page' thay đổi
  useEffect(() => {
    fetchData();
  }, [dateRange, pagination.page]);

  // Xử lý phân trang
  const totalPages = useMemo(() => {
    return Math.ceil(pagination.totalItems / pagination.limit);
  }, [pagination.totalItems, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="p-6 md:p-14 space-y-8">
      {/* Header và Bộ lọc Ngày */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          {user?.role === "admin" ? "Tổng quan Doanh thu" : "Doanh thu của tôi"}
        </h1>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Chọn khoảng thời gian" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7day">7 ngày qua</SelectItem>
            <SelectItem value="30day">30 ngày qua</SelectItem>
            <SelectItem value="month">Tháng này</SelectItem>
            <SelectItem value="year">Năm nay</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && !stats && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* --- Thẻ KPI --- */}
      {/* 4. SỬA JSX: Đổi `stats && !loading` thành `stats`
          (vì stats sẽ là null cho đến khi mock data được load)
      */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tổng Doanh thu
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Doanh thu (Kỳ này)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.currentPeriodRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Booking đã thanh toán
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.paidBookings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chờ thanh toán (Payout)
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.pendingPayout)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* --- Biểu đồ --- */}
      <Card>
        <CardHeader>
          <CardTitle>Biểu đồ Doanh thu</CardTitle>
          <CardDescription>
            Doanh thu theo ngày trong kỳ đã chọn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 5. SỬA JSX: Thêm kiểm tra `chartData.length`
              (Mặc dù không cần thiết với mock data, nhưng đây là good practice)
          */}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#888888" fontSize={12} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[350px] flex items-center justify-center text-muted-foreground">
              {loading ? "Đang tải biểu đồ..." : "Không có dữ liệu biểu đồ."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Bảng Giao dịch --- */}
      <Card>
        <CardHeader>
          <CardTitle>Giao dịch gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Tên Tour</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.transactionId}>
                    <TableCell className="font-medium">
                      #{tx.bookingId}
                    </TableCell>
                    <TableCell>{tx.tourTitle}</TableCell>
                    <TableCell>{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{tx.paymentMethod}</Badge>
                    </TableCell>
                    <TableCell>
                      {tx.status === "SUCCESS" ? (
                        <Badge className="bg-green-600">Thành công</Badge>
                      ) : (
                        <Badge variant="destructive">{tx.status}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(tx.createdAt), "dd/MM/yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Phân trang cho Bảng */}
          {!loading && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
