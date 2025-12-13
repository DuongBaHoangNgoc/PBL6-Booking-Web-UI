"use client";

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
import { useAuth } from "@/context/useAuth";

export function SupplierDashboard() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalBookings: 0,
    totalParticipants: 0,
    totalEarnings: 0,
    totalDone: 0,
    totalBooked: 0,
  });

  const [revenueData, setRevenueData] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Biểu đồ doanh thu
  const [period, setPeriod] = useState("month");
  // Top destinations
  const [destPeriod, setDestPeriod] = useState("month");

  // ===== Nhóm doanh thu theo period, dựa trên BOOKINGS của supplier =====
  const groupRevenue = (bookings, mode) => {
    const map = new Map();

    bookings
      .filter((b) => b.bookingStatus === "confirmed")
      .forEach((b) => {
        const date = new Date(b.bookingDate);
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
          default:
            key = date.toISOString().split("T")[0];
        }

        const sum = map.get(key) || 0;
        map.set(key, sum + Number(b.totalPrice || 0));
      });

    return Array.from(map, ([name, value]) => ({ name, value }));
  };

  useEffect(() => {
    if (!user) return;

    const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    // Socket chỉ để cập nhật realtime (nếu backend có hỗ trợ)
    const socket = io(baseURL);

    const fetchData = async () => {
      try {
        setLoading(true);

        const bookingsRes = await axios.get(
          `${baseURL}/bookings/FilterPagination?supplierId=${user.userId}&page=1&limit=1000`
        );

        const bookings =
          bookingsRes.data?.data?.bookings &&
          Array.isArray(bookingsRes.data.data.bookings)
            ? bookingsRes.data.data.bookings
            : [];

        // ====== TÍNH TOÁN THỐNG KÊ ======
        const totalBookings = bookings.length;

        const confirmedBookings = bookings.filter(
          (b) => b.bookingStatus === "confirmed"
        );

        const totalParticipants = confirmedBookings.reduce((sum, b) => {
          const adults = Number(b.numAdults || 0);
          const children = Number(b.numChildren || 0);
          return sum + adults + children;
        }, 0);

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

        // Doanh thu theo thời gian (từ bookings)
        const groupedRevenue = groupRevenue(bookings, period);

        // Recent bookings (10 booking mới nhất)
        const sortedRecent = [...bookings]
          .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
          .slice(0, 10);

        // Top destinations theo tour.destination
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
              // dùng số participants: adults + children
              const participants =
                Number(b.numAdults || 0) + Number(b.numChildren || 0);
              destinations[dest] = (destinations[dest] || 0) + participants;
            }
          }
        });

        const totalDestParticipants = Object.values(destinations).reduce(
          (a, b) => a + b,
          0
        );

        const colors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

        const topDestinationsData =
          totalDestParticipants > 0
            ? Object.entries(destinations)
                .map(([name, participants], i) => ({
                  name,
                  percent: parseFloat(
                    ((participants / totalDestParticipants) * 100).toFixed(1)
                  ),
                  participants,
                  color: colors[i % colors.length],
                }))
                .sort((a, b) => b.participants - a.participants)
                .slice(0, 4)
            : [];

        // ====== Cập nhật state ======
        setStats({
          totalBookings,
          totalParticipants,
          totalEarnings,
          totalDone,
          totalBooked,
        });
        setRevenueData(groupedRevenue);
        setRecentBookings(sortedRecent);
        setTopDestinations(topDestinationsData);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu Supplier Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentOnly = async () => {
      try {
        const bookingsRes = await axios.get(
          `${baseURL}/bookings/FilterPagination?supplierId=${user.userId}&page=1&limit=1000`
        );
        const bookings =
          bookingsRes.data?.data?.bookings &&
          Array.isArray(bookingsRes.data.data.bookings)
            ? bookingsRes.data.data.bookings
            : [];

        const sortedRecent = [...bookings]
          .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
          .slice(0, 10);

        setRecentBookings(sortedRecent);
      } catch (err) {
        console.error("❌ Lỗi khi tải recent bookings:", err);
      }
    };

    // Gọi lần đầu
    fetchData();

    socket.on("new_booking", () => {
      console.log("🔥 Supplier new_booking");
      fetchRecentOnly();
    });

    socket.on("booking_status_changed", () => {
      console.log("🔥 Supplier booking_status_changed");
      fetchData();
    });

    socket.on("dashboard_update", () => {
      console.log("🔥 Supplier dashboard_update");
      fetchData();
    });

    return () => {
      socket.disconnect();
    };
  }, [user, period, destPeriod]);

  if (!user) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Đang tải thông tin nhà cung cấp...
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-center py-20 text-muted-foreground">
        Đang tải dữ liệu dashboard...
      </p>
    );
  }

  return (
    <section className="min-h-screen my-10 pb-24">
      <div className="container mx-auto px-4">
        {/* Header giống ảnh: chữ đen, nền trắng */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#111827] mb-2">Bookings</h1>
        </div>

        {/* Stat Cards – màu xanh nhạt giống ảnh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 flex justify-between items-center bg-blue-50 border-none shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Booking
              </p>
              <p className="text-3xl font-bold text-[#111827] mt-1">
                {stats.totalBookings.toLocaleString("vi-VN")}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-300" />
          </Card>

          <Card className="p-6 flex justify-between items-center bg-sky-50 border-none shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Participants
              </p>
              <p className="text-3xl font-bold text-[#111827] mt-1">
                {stats.totalParticipants.toLocaleString("vi-VN")}
              </p>
            </div>
            <Users className="w-10 h-10 text-sky-300" />
          </Card>

          <Card className="p-6 flex justify-between items-center bg-indigo-50 border-none shadow-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total Earnings
              </p>
              <p className="text-3xl font-bold text-[#111827] mt-1">
                {stats.totalEarnings.toLocaleString("vi-VN")} ₫
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-indigo-300" />
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* LEFT: Revenue Overview (2/3 width) */}
          <Card className="p-6 shadow-sm border-none lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#111827]">
                Revenue Overview
              </h2>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-1 text-sm"
              >
                <option value="day">Today</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* RIGHT: Top Destinations (1/3 width) */}
          <Card className="p-6 shadow-sm border-none">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#111827]">
                Top Destinations
              </h2>

              <select
                value={destPeriod}
                onChange={(e) => setDestPeriod(e.target.value)}
                className="bg-blue-100 text-blue-700 text-xs font-semibold rounded-full px-3 py-1 border-0"
              >
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="flex flex-col items-center">
              {/* PIE CHART */}
              <div className="w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topDestinations}
                      dataKey="percent"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {topDestinations.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* LIST */}
              <div className="w-full mt-6 space-y-3">
                {topDestinations.map((dest, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full mt-1"
                      style={{ backgroundColor: dest.color }}
                    ></span>
                    <div>
                      <p className="font-semibold text-[#111827]">
                        {dest.name} ({dest.percent}%)
                      </p>
                      <p className="text-xs text-gray-500">
                        {dest.participants} Participants
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Total Trips – giống block nhỏ ở giữa ảnh */}
        <Card className="p-6 mb-8 shadow-sm border-none">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 overflow-hidden">
              <img
                src="https://cdn.creazilla.com/emojis/54728/airplane-emoji-clipart-xl.png"
                alt="Airplane"
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Total Trips
              </p>
              <p className="text-2xl font-bold text-[#111827] mt-1">
                {(stats.totalDone + stats.totalBooked).toLocaleString("vi-VN")}
              </p>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden mb-4 flex">
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

          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-400" />
              <span>Done</span>
              <strong className="ml-1">
                {stats.totalDone.toLocaleString("vi-VN")}
              </strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-blue-400" />
              <span>Booked</span>
              <strong className="ml-1">
                {stats.totalBooked.toLocaleString("vi-VN")}
              </strong>
            </div>
          </div>
        </Card>

        {/* Recent Bookings – bảng dưới giống ảnh */}
        <Card className="p-6 shadow-sm border-none">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#111827]">
              Recent Bookings
            </h2>
            <Link to="/supplier/bookings">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-full">
                View All
              </Button>
            </Link>
          </div>

          {recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500">No recent bookings found.</p>
          ) : (
            <div className="overflow-y-scroll max-h-80 rounded-md border border-gray-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Booking Code
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Package
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Participants
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Total</th>
                    <th className="text-left py-3 px-4 font-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr
                      key={b.bookingId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">{b.fullName}</td>
                      <td className="py-3 px-4">{b.bookingId}</td>
                      <td className="py-3 px-4">{b.tour?.title || "N/A"}</td>
                      <td className="py-3 px-4">
                        {(
                          Number(b.numAdults || 0) + Number(b.numChildren || 0)
                        ).toLocaleString("vi-VN")}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(b.bookingDate).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {Number(b.totalPrice || 0).toLocaleString("vi-VN")} ₫
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
