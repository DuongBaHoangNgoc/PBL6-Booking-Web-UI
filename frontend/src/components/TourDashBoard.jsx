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
import { Link } from "react-router-dom"; // Sửa: import từ react-router-dom

// Dữ liệu mẫu (sau này bạn sẽ thay bằng API)
const chartData = [
  { month: "Jan", bookings: 4 },
  { month: "Feb", bookings: 3 },
  { month: "Mar", bookings: 2 },
  { month: "Apr", bookings: 5 },
  { month: "May", bookings: 4 },
  { month: "Jun", bookings: 6 },
];

const recentBookings = [
  {
    id: 1,
    tour: "Bali Paradise Escape",
    destination: "Bali, Indonesia",
    date: "2025-06-15",
    status: "Confirmed",
    price: 1299,
  },
  {
    id: 2,
    tour: "Tokyo Cultural Tour",
    destination: "Tokyo, Japan",
    date: "2025-07-20",
    status: "Pending",
    price: 1599,
  },
  {
    id: 3,
    tour: "Paris Romance Package",
    destination: "Paris, France",
    date: "2025-08-10",
    status: "Confirmed",
    price: 1399,
  },
];

// Sửa: Đổi tên function Dashboard -> TourDashboard để khớp AppRoutes
export function TourDashboard() {
  return (
    // Component này sẽ render bên trong <ClientLayout>
    // ClientLayout đã có nền gray và padding top
    // Chúng ta thêm padding cho nội dung bên trong
    <section className="h-screen my-28">
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
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
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

        {/* Charts and Recent Bookings */}
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
              {/* Sửa: href -> to */}
              <Link to="/tours" className="block">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground justify-start gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Browse Tours
                </Button>
              </Link>
              {/* Sửa: href -> to */}
              <Link to="/bookings" className="block">
                <Button
                  variant="outline"
                  className="w-full bg-transparent justify-start gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  My Bookings
                </Button>
              </Link>
              {/* Sửa: href -> to */}
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

        {/* Recent Bookings */}
        <Card className="mt-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Recent Bookings
            </h2>
            {/* Sửa: href -> to */}
            <Link to="/bookings">
              <Button variant="outline" className="bg-transparent">
                View All
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Tour
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">
                    Destination
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
                {recentBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground">
                      {booking.tour}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {booking.destination}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {booking.date}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          booking.status === "Confirmed"
                            ? "bg-primary/10 text-primary"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      ${booking.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}
