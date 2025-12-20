import { useState, useEffect } from "react";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import { Calendar, Users, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalUsers: 0,
    totalEarnings: 0,
    totalDone: 0,
    totalBooked: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("day"); // Biểu đồ doanh thu
  const [destPeriod, setDestPeriod] = useState("month"); // Top destinations

  useEffect(() => {
    // Kết nối socket
    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const socket = io(baseURL);
    // Hàm gọi API
    const fetchData = async () => {
      try {
        const [bookingsRes, usersRes, transactionsRes] = await Promise.all([
          axios.get(`${baseURL}/bookings/FilterPagination?page=1&limit=1000`),
          axios.get(`${baseURL}/user/FilterPagination?page=1&limit=1000`),
          axios.get(`${baseURL}/transactions-coins`),
        ]);

        const bookings = bookingsRes.data?.data?.bookings || [];
        const users = usersRes.data?.data?.users || [];
        const transactions = transactionsRes.data?.data || [];

        // --- PHẦN TÍNH TOÁN ---
        const confirmedBookings = bookings.filter(
          (b) => b.bookingStatus === "confirmed"
        );
        const totalBookings = confirmedBookings.length;

        const totalUsers = users.length;

        // 🔥 Doanh thu = tổng tiền của booking đã confirmed
        const totalEarnings = confirmedBookings.reduce(
          (sum, b) => sum + Number(b.totalPrice || 0),
          0
        );

        const today = new Date();
        let totalDone = 0;
        let totalBooked = 0;

        bookings.forEach((b) => {
          if (b.bookingStatus === "confirmed" && b.date?.endDate) {
            const end = new Date(b.date.endDate);
            if (end < today) totalDone++;
            else totalBooked++;
          }
        });

        const grouped = groupRevenue(transactions, period);

        const sorted = bookings
          .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
          .slice(0, 10);

        const destinations = {};
        const now = new Date();

        bookings.forEach((b) => {
          if (b.bookingStatus === "confirmed" && b.tour?.destination) {
            const bookingDate = new Date(b.bookingDate);

            const isSameMonth =
              bookingDate.getMonth() === now.getMonth() &&
              bookingDate.getFullYear() === now.getFullYear();

            const isSameYear = bookingDate.getFullYear() === now.getFullYear();

            if (
              destPeriod === "all" ||
              (destPeriod === "month" && isSameMonth) ||
              (destPeriod === "year" && isSameYear)
            ) {
              const dest = b.tour.destination;
              const participants =
                Number(b.numAdults || 0) + Number(b.numChildren || 0);
              destinations[dest] = (destinations[dest] || 0) + participants;
            }
          }
        });

        const totalDest = Object.values(destinations).reduce(
          (a, b) => a + b,
          0
        );

        const topDestinationsData =
          totalDest > 0
            ? Object.entries(destinations)
                .map(([name, count], i) => ({
                  name,
                  percent: parseFloat(((count / totalDest) * 100).toFixed(1)),
                  participants: count,
                  color: ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"][i % 4],
                }))
                .sort((a, b) => b.participants - a.participants)
                .slice(0, 4)
            : [];

        // --- Cập nhật UI ---
        setStats({
          totalBookings,
          totalUsers,
          totalEarnings,
          totalDone,
          totalBooked,
        });
        setRevenueData(grouped);
        setRecentBookings(sorted);
        setTopDestinations(topDestinationsData);
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentBookings = async () => {
      const bookingsRes = await axios.get(
        `${baseURL}/bookings/FilterPagination?page=1&limit=1000`
      );
      const bookings = bookingsRes.data?.data?.bookings || [];

      const sorted = bookings
        .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
        .slice(0, 10);

      setRecentBookings(sorted);
    };

    // Gọi lần đầu
    fetchData();

    // 🔥 Chỉ update Recent Bookings khi có booking mới
    socket.on("new_booking", () => {
      console.log("🔥 New booking received");
      fetchRecentBookings();
    });

    // 🔥 Update toàn bộ dashboard khi booking được confirmed
    socket.on("booking_status_changed", () => {
      console.log("🔥 Booking status changed");
      fetchData();
    });

    // 🔥 Cập nhật toàn bộ dashboard
    socket.on("dashboard_update", () => {
      console.log("🔥 Dashboard update received");
      fetchData();
    });

    // Cleanup socket khi rời trang
    return () => {
      socket.disconnect();
    };
  }, [period, destPeriod])

  // 🔹 Hàm nhóm doanh thu
  function groupRevenue(transactions, mode) {
    const map = new Map();
    transactions
      .filter((t) => t.status === "SUCCESS")
      .forEach((t) => {
        const date = new Date(t.createdAt);
        let key = "";

        switch (mode) {
          case "day":
            key = date.toISOString().split("T")[0];
            break;
          case "week":
            key = `Week ${Math.ceil(date.getDate() / 7)}`;
            break;
          case "month":
            key = date.toLocaleString("en-US", { month: "short" });
            break;
          case "year":
            key = date.getFullYear();
            break;
        }

        const sum = map.get(key) || 0;
        map.set(key, sum + Number(t.amount || 0));
      });

    return Array.from(map, ([name, value]) => ({ name, value }));
  }

  if (loading) return <p className="text-center py-20">Đang tải dữ liệu...</p>;

  return (
    <section className="min-h-screen my-16 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Tổng quan hoạt động kinh doanh
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Bookings</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalBookings}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-primary/20" />
          </Card>

          <Card className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">New Customers</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="w-8 h-8 text-primary/20" />
          </Card>

          <Card className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalEarnings.toLocaleString("vi-VN")}₫
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-primary/20" />
          </Card>
        </div>

        {/* Revenue Overview */}
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Revenue Overview</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="border rounded px-3 py-1 text-sm"
            >
              <option value="day">Ngày</option>
              <option value="week">Tuần</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#4f46e5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* 🌍 Top Destinations */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Top Destinations
            </h2>
            <select
              value={destPeriod}
              onChange={(e) => setDestPeriod(e.target.value)}
              className="bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg px-3 py-1 border-0 focus:outline-none"
            >
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {topDestinations.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Không có dữ liệu điểm đến trong giai đoạn này.
            </p>
          ) : (
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDestinations}
                      dataKey="percent"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {topDestinations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full md:w-1/2 space-y-4">
                {topDestinations.map((dest, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dest.color }}
                      ></span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {dest.name} ({dest.percent}%)
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dest.participants.toLocaleString()} Participants
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* ✈️ Total Trips */}
        <Card className="p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 overflow-hidden">
              <img
                src="https://cdn.creazilla.com/emojis/54728/airplane-emoji-clipart-xl.png"
                alt="Airplane"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Trips</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.totalDone + stats.totalBooked}
              </p>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-4 flex">
            <div
              className="bg-green-400"
              style={{
                width: `${
                  (stats.totalDone /
                    (stats.totalDone + stats.totalBooked || 1)) *
                    100 || 0
                }%`,
              }}
            ></div>
            <div
              className="bg-blue-400"
              style={{
                width: `${
                  (stats.totalBooked /
                    (stats.totalDone + stats.totalBooked || 1)) *
                    100 || 0
                }%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400"></span>
              <span>Done</span>
              <strong className="ml-1">{stats.totalDone}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-400"></span>
              <span>Booked</span>
              <strong className="ml-1">{stats.totalBooked}</strong>
            </div>
          </div>
        </Card>

        {/* 📋 Recent Bookings */}
        <Card className="p-6">
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

          {recentBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm mt-4">
              No recent bookings found.
            </p>
          ) : (
            <div className="overflow-y-scroll max-h-80 rounded-md border border-border scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-background z-10 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">Tour</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.bookingId}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-4">{b.tour?.title || "N/A"}</td>
                      <td className="py-3 px-4">{b.fullName}</td>
                      <td className="py-3 px-4">
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
                      <td className="py-3 px-4 font-semibold">
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
