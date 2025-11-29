import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/useAuth";

export function SupplierDashboard() {
  const { user } = useAuth();

  // (Sau này, bạn sẽ dùng useEffect và gọi các API của Supplier ở đây
  // ví dụ: const stats = await getSupplierStats(user.userId);)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Chào mừng, {user?.fullName || "Supplier"}!
      </h1>
      <p className="text-muted-foreground">
        Đây là trang thống kê dành cho Nhà cung cấp.
      </p>

      {/* Thống kê mẫu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dịch vụ đang cung cấp</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">12</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Booking mới (Tuần này)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tổng doanh thu (Tháng này)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">$3,500</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
