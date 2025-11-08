import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  MapPin,
  Calendar,
  DollarSign,
  Heart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

// Dữ liệu mẫu (chart)
const chartData = [
  { month: "Jan", bookings: 4 },
  { month: "Feb", bookings: 3 },
  { month: "Mar", bookings: 2 },
  { month: "Apr", bookings: 5 },
  { month: "May", bookings: 4 },
  { month: "Jun", bookings: 6 },
];

export function TourDashboard() {
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Gọi API để lấy danh sách booking
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/bookings/FilterPagination?page=1&limit=10"
        );
        setRecentBookings(res.data?.data?.bookings || []);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <section className="min-h-screen my-28 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's your travel overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Bookings
                </p>
                <p className="text-3xl font-bold text-foreground">12</p>
              </div>
              <Calendar className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Spent
                </p>
                <p className="text-3xl font-bold text-foreground">$15,297</p>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Destinations
                </p>
                <p className="text-3xl font-bold text-foreground">8</p>
              </div>
              <MapPin className="w-8 h-8 text-primary/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wishlist</p>
                <p className="text-3xl font-bold text-foreground">5</p>
              </div>
              <Heart className="w-8 h-8 text-primary/20" />
            </div>
          </Card>
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Booking Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="bookings"
                  fill="var(--color-primary)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/tours" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Browse Tours
                </Button>
              </Link>

              <Link to="/bookings" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Button>
              </Link>

              <Link to="/profile" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start gap-2"
                >
                  <Users className="w-4 h-4" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* ✅ Recent Bookings */}
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Recent Bookings
          </h2>
          <Link to="/admin/bookings">
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
            >
              View All
            </Button>
          </Link>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No recent bookings found.
            </p>
          ) : (
            // ✅ Giới hạn chiều cao + scroll nội bộ
            <div className="overflow-y-scroll max-h-80 rounded-md border border-border scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Tour
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.bookingId}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-foreground">
                        {b.tour?.title || "N/A"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {b.fullName}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(b.bookingDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            b.bookingStatus === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : b.bookingStatus === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {Number(b.totalPrice).toLocaleString("vi-VN")}₫
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
