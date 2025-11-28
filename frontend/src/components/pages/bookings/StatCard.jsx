import React from "react" // Đã xóa "type"
import { MoreVertical, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/useAuth";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button" // <-- Đã sửa 'in' thành 'from'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { motion, animate } from 'framer-motion'


const chartData = [
  { date: "Aug 27", done: 1200, cancelled: 400 },
  { date: "Sep 27", done: 1300, cancelled: 350 },
  { date: "Oct 27", done: 1400, cancelled: 380 },
  { date: "Nov 27", done: 1600, cancelled: 450 },
  { date: "Dec 27", done: 1500, cancelled: 420 },
  { date: "Jan 28", done: 1780, cancelled: 600 },
  { date: "Feb 28", done: 1650, cancelled: 520 },
  { date: "Mar 28", done: 1700, cancelled: 480 },
  { date: "Apr 28", done: 1900, cancelled: 550 },
  { date: "May 28", done: 1850, cancelled: 520 },
  { date: "Jun 28", done: 1750, cancelled: 480 },
  { date: "Jul 28", done: 1700, cancelled: 450 },
]

const packages = [
    { name: 'Tokyo Cultural Adventure', percent: 35, participants: 650 },
    { name: 'Bali Beach Escape', percent: 28, participants: 520 },
    { name: 'Safari Adventure', percent: 22, participants: 408 },
    { name: 'Greek Island Hopping', percent: 15, participants: 278 },
  ]

export function StatCard({ title, value, trend, isPositive, chart }) {
  const { user } = useAuth();
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
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <button className="p-1 hover:bg-white rounded transition">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold mb-2">{value}</p>
            <div className="flex items-center gap-1">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
                {isPositive ? "+" : ""}
                {trend}%
              </span>
              <span className="text-xs text-muted-foreground">from last week</span>
            </div>
          </div>
          <div className="w-16 h-12">{chart}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatCardsGrid() {
  const [progress, setProgress] = useState(0)
  const totalDash = 251.2
  const targetPercent = 200 

  useEffect(() => {
    const controls = animate(0, targetPercent, {
      duration: 2,
      ease: 'easeInOut',
      onUpdate: (value) => setProgress(value),
    })
    return () => controls.stop()
  }, [])

  return (
    // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6">
    //   <StatCard
    //     title="Total Booking"
    //     value="1,200"
    //     trend={2.98}
    //     isPositive={true}
    //     chart={
    //       <svg viewBox="0 0 60 40" className="w-full h-full">
    //         <path d="M0 30 Q15 20, 30 15 T60 10" stroke="#3b82f6" strokeWidth="2" fill="none" />
    //         <path d="M0 30 Q15 20, 30 15 T60 10 L60 40 L0 40" fill="#dbeafe" />
    //       </svg>
    //     }
    //   />

    //     <StatCard
    //     title="Total Participants"
    //     value="2,845"
    //     trend={-1.45}
    //     isPositive={false}
    //     chart={
    //       <svg viewBox="0 0 60 40" className="w-full h-full">
    //         <path d="M0 15 Q15 25, 30 20 T60 25" stroke="#ef4444" strokeWidth="2" fill="none" />
    //         <path d="M0 15 Q15 25, 30 20 T60 25 L60 40 L0 40" fill="#fee2e2" />
    //       </svg>
    //     }
    //   />


    //   <StatCard
    //     title="Total Earnings"
    //     value="$14,795"
    //     trend={3.75}
    //     isPositive={true}
    //     chart={
    //       <svg viewBox="0 0 60 40" className="w-full h-full">
    //         <path d="M0 25 Q15 15, 30 12 T60 8" stroke="#3b82f6" strokeWidth="2" fill="none" />
    //         <path d="M0 25 Q15 15, 30 12 T60 8 L60 40 L0 40" fill="#dbeafe" />
    //       </svg>
    //     }
    //   />

    //   <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0">
    //     <CardContent className="p-6">
    //       <div className="flex items-start justify-between mb-4">
    //         <h3 className="text-sm font-medium text-muted-foreground">Top Packages</h3>
    //         <button className="p-1 hover:bg-white rounded transition">
    //           <MoreVertical className="w-4 h-4 text-muted-foreground" />
    //         </button>
    //       </div>

    //       <div className="relative w-24 h-24 mx-auto mb-4">
    //         <svg viewBox="0 0 100 100" className="w-full h-full">
    //           <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
    //           <circle
    //             cx="50"
    //             cy="50"
    //             r="40"
    //             fill="none"
    //             stroke="#3b82f6"
    //             strokeWidth="8"
    //             strokeDasharray="75.4 251.2"
    //             strokeDashoffset="0"
    //             strokeLinecap="round"
    //           />
    //           <text x="50" y="55" textAnchor="middle" className="text-sm font-bold fill-foreground">
    //             1,856
    //           </text>
    //         </svg>
    //       </div>

    //       <p className="text-xs text-muted-foreground text-center">Total Participants</p>
    //     </CardContent>
    //   </Card>

    //   <Card className="m-6">
    //   <CardHeader className="flex flex-row items-center justify-between">
    //     <CardTitle>Trips Overview</CardTitle>
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
    //           Last 12 Months
    //           <ChevronDown className="w-4 h-4 ml-2" />
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end">
    //         <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
    //         <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
    //         <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
    //         <DropdownMenuItem>Last 12 Months</DropdownMenuItem>
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   </CardHeader>

    //   <CardContent>
    //     <div className="mb-4 flex gap-6">
    //       <div className="flex items-center gap-2">
    //         <div className="w-3 h-3 bg-blue-400 rounded-full" />
    //         <span className="text-sm text-muted-foreground">Done</span>
    //       </div>
    //       <div className="flex items-center gap-2">
    //         <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-dashed" />
    //         <span className="text-sm text-muted-foreground">Cancelled</span>
    //       </div>
    //     </div>

    //     <ResponsiveContainer width="100%" height={300}>
    //       <AreaChart data={chartData}>
    //         <defs>
    //           <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
    //             <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
    //             <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
    //           </linearGradient>
    //           <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
    //             <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
    //             <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
    //           </linearGradient>
    //         </defs>
    //         <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
    //         <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
    //         <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
    //         <Tooltip
    //           contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
    //           labelStyle={{ color: "#000" }}
    //         />
    //         <Area
    //           type="monotone"
    //           dataKey="done"
    //           stroke="#60a5fa"
    //           strokeWidth={2}
    //           fillOpacity={1}
    //           fill="url(#colorDone)"
    //         />
    //         <Area
    //           type="monotone"
    //           dataKey="cancelled"
    //           stroke="#d1d5db"
    //           strokeWidth={2}
    //           fillOpacity={1}
    //           fill="url(#colorCancelled)"
    //           strokeDasharray="5 5"
    //         />
    //       </AreaChart>
    //     </ResponsiveContainer>
    //   </CardContent>
    // </Card>
    // </div>

    // GHI CHÚ: Bạn sẽ cần import các component (StatCard, Card, DropdownMenu...)
// ở đầu file của bạn.

<div className="flex flex-col lg:flex-row gap-6 px-6">
  {/* --- KHỐI BÊN TRÁI (3/4 chiều rộng) --- */}
  <div className="flex flex-col gap-6 lg:w-3/4">
    {/* 1. Lưới 3 thẻ Stat Card */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Total Booking"
        value="1,200"
        trend={2.98}
        isPositive={true}
        chart={
          <svg viewBox="0 0 60 40" className="w-full h-full">
            <path d="M0 30 Q15 20, 30 15 T60 10" stroke="#3b82f6" strokeWidth="2" fill="none" />
            <path d="M0 30 Q15 20, 30 15 T60 10 L60 40 L0 40" fill="#dbeafe" />
          </svg>
        }
      />

      <StatCard
        title="Total Participants"
        value="2,845"
        trend={-1.45}
        isPositive={false}
        chart={
          <svg viewBox="0 0 60 40" className="w-full h-full">
            <path d="M0 15 Q15 25, 30 20 T60 25" stroke="#ef4444" strokeWidth="2" fill="none" />
            <path d="M0 15 Q15 25, 30 20 T60 25 L60 40 L0 40" fill="#fee2e2" />
          </svg>
        }
      />

      <StatCard
        title="Total Earnings"
        value="$14,795"
        trend={3.75}
        isPositive={true}
        chart={
          <svg viewBox="0 0 60 40" className="w-full h-full">
            <path d="M0 25 Q15 15, 30 12 T60 8" stroke="#3b82f6" strokeWidth="2" fill="none" />
            <path d="M0 25 Q15 15, 30 12 T60 8 L60 40 L0 40" fill="#dbeafe" />
          </svg>
        }
      />
    </div>

    {/* 2. Thẻ Trips Overview (nằm dưới) */}
    {/* Đã xóa m-6 (margin) khỏi Card này để khớp layout */}
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trips Overview</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
              Last 12 Months
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
            <DropdownMenuItem>Last 12 Months</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span className="text-sm text-muted-foreground">Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-dashed" />
            <span className="text-sm text-muted-foreground">Cancelled</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              labelStyle={{ color: "#000" }}
            />
            <Area
              type="monotone"
              dataKey="done"
              stroke="#60a5fa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDone)"
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              stroke="#d1d5db"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCancelled)"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>

  {/* --- KHỐI BÊN PHẢI (1/4 chiều rộng) --- */}
  <div className="lg:w-1/4 flex flex-col">
    {/* 3. Thẻ Top Packages */}
    {/* Thêm 'flex-1' để thẻ này dãn hết chiều cao của cột bên phải */}
    {/* <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0 flex-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-sm font-medium text-muted-foreground">Top Packages</h3>
          <button className="p-1 hover:bg-white rounded transition">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeDasharray="75.4 251.2"
              strokeDashoffset="0"
              strokeLinecap="round"
            />
            <text x="50" y="55" textAnchor="middle" className="text-sm font-bold fill-foreground">
              1,856
            </text>
          </svg>
        </div>

        <p className="text-xs text-muted-foreground text-center">Total Participants</p>
      </CardContent>
    </Card> */}
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-0 flex-1">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground">Top Packages</h3>
          <button className="p-1 hover:bg-white/40 rounded transition">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Circular Progress */}
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg viewBox="0 0 100 100" className="w-full h-full rotate-[-90deg]">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="8"
              strokeDasharray={`${progress} ${totalDash}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-[0deg]">
            <p className="text-xs text-muted-foreground">This Week</p>
            <p className="text-3xl font-bold">1,856</p>
            <p className="text-xs text-muted-foreground">Total Participants</p>
          </div>
        </div>

        {/* Package List */}
        <div className="space-y-4 mt-6">
          {packages.map((pkg, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold ${
                  i === 0
                    ? 'bg-blue-500 text-white'
                    : i === 1
                    ? 'bg-blue-400 text-white'
                    : i === 2
                    ? 'bg-blue-300 text-white'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {pkg.percent}%
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{pkg.name}</p>
                <p className="text-xs text-muted-foreground">{pkg.participants} Participants</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
</div>
    
  )
}