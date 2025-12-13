import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import { io } from "socket.io-client";
import { useAuth } from "@/context/useAuth";

const PERIOD_OPTIONS = [
  { value: "7", label: "7 ngày qua" },
  { value: "30", label: "30 ngày qua" },
  { value: "90", label: "90 ngày qua" },
  { value: "all", label: "Tất cả" },
];

const toVND = (n) => `${Number(n || 0).toLocaleString("vi-VN")} ₫`;

// Format trục X (MM/DD)
const fmtMMDD = (d) =>
  `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(
    2,
    "0"
  )}`;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function isWithinPeriod(date, period) {
  if (period === "all") return true;
  const days = Number(period);
  const now = startOfDay(new Date());
  const from = new Date(now);
  from.setDate(from.getDate() - (days - 1));
  const x = startOfDay(date);
  return x >= from && x <= now;
}

// Series doanh thu theo ngày
function buildDailySeries(bookings, period) {
  const now = startOfDay(new Date());

  let from = new Date(now);
  if (period === "all") {
    const dates = bookings
      .map((b) => new Date(b.bookingDate))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map(startOfDay)
      .sort((a, b) => a.getTime() - b.getTime());

    from = dates[0] ?? new Date(now);
    if (!dates[0]) from.setDate(from.getDate() - 29);
  } else {
    from.setDate(from.getDate() - (Number(period) - 1));
  }

  const map = new Map();

  bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .forEach((b) => {
      const d = startOfDay(new Date(b.bookingDate));
      if (Number.isNaN(d.getTime())) return;
      if (!isWithinPeriod(d, period)) return;

      const key = d.toISOString().slice(0, 10);
      map.set(key, (map.get(key) || 0) + Number(b.totalPrice || 0));
    });

  const series = [];
  for (
    let d = new Date(from);
    d.getTime() <= now.getTime();
    d.setDate(d.getDate() + 1)
  ) {
    const key = startOfDay(d).toISOString().slice(0, 10);
    series.push({
      name: fmtMMDD(new Date(d)),
      value: map.get(key) || 0,
      _key: key,
    });
  }

  return series;
}

function getPeriodRevenue(bookings, period) {
  return bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .filter((b) => isWithinPeriod(new Date(b.bookingDate), period))
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
}

function getAllRevenue(bookings) {
  return bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
}

function getPaidCount(bookings, period) {
  return bookings
    .filter((b) => b.bookingStatus === "confirmed")
    .filter((b) => isWithinPeriod(new Date(b.bookingDate), period)).length;
}

function getPendingPayout(bookings, period) {
  // tạm coi pending = "chờ thanh toán"
  return bookings
    .filter((b) => b.bookingStatus === "pending")
    .filter((b) => isWithinPeriod(new Date(b.bookingDate), period))
    .reduce((sum, b) => sum + Number(b.totalPrice || 0), 0);
}


function statusBadge(status) {
  const s = String(status || "").toLowerCase();
  if (s === "confirmed") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        Thành công
      </span>
    );
  }
  if (s === "pending") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
        PENDING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
      {status || "N/A"}
    </span>
  );
}

export function EarningsPage() {
  const { user } = useAuth();

  const [period, setPeriod] = useState("30");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const baseURL = useMemo(
    () => import.meta.env.VITE_API_URL || "http://localhost:3000",
    []
  );

  const fetchBookings = async () => {
    if (!user) return;

    const res = await axios.get(
      `${baseURL}/bookings/FilterPagination?supplierId=${user.userId}&page=1&limit=1000`
    );

    const list =
      res.data?.data?.bookings && Array.isArray(res.data.data.bookings)
        ? res.data.data.bookings
        : [];

    setBookings(list);
  };

  useEffect(() => {
    if (!user) return;

    const socket = io(baseURL);

    const run = async () => {
      try {
        setLoading(true);
        await fetchBookings();
      } catch (e) {
        console.error("❌ Lỗi tải dữ liệu doanh thu:", e);
      } finally {
        setLoading(false);
      }
    };

    run();

    socket.on("new_booking", fetchBookings);
    socket.on("booking_status_changed", fetchBookings);
    socket.on("dashboard_update", fetchBookings);

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, baseURL]);

  // reset trang khi đổi period
  useEffect(() => {
    setPage(1);
  }, [period]);

  const totalRevenue = useMemo(() => getAllRevenue(bookings), [bookings]);
  const periodRevenue = useMemo(
    () => getPeriodRevenue(bookings, period),
    [bookings, period]
  );
  const paidCount = useMemo(
    () => getPaidCount(bookings, period),
    [bookings, period]
  );
  const pendingPayout = useMemo(
    () => getPendingPayout(bookings, period),
    [bookings, period]
  );

  const chartData = useMemo(
    () => buildDailySeries(bookings, period),
    [bookings, period]
  );

  const filteredForTable = useMemo(() => {
    return [...bookings]
      .filter((b) => isWithinPeriod(new Date(b.bookingDate), period))
      .sort(
        (a, b) =>
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
      );
  }, [bookings, period]);

  const totalPages = Math.max(1, Math.ceil(filteredForTable.length / pageSize));
  const pageRows = filteredForTable.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
        Đang tải dữ liệu doanh thu...
      </p>
    );
  }

  return (
    <section className="min-h-screen my-8 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#111827]">
              Doanh thu của tôi
            </h1>
          </div>

          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm"
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 4 stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Tổng Doanh thu</p>
            <p className="text-2xl font-bold text-[#111827]">
              {toVND(totalRevenue)}
            </p>
          </Card>

          <Card className="p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Doanh thu (Kỳ này)</p>
            <p className="text-2xl font-bold text-[#111827]">
              {toVND(periodRevenue)}
            </p>
          </Card>

          <Card className="p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Booking đã thanh toán</p>
            <p className="text-2xl font-bold text-[#111827]">+{paidCount}</p>
          </Card>

          <Card className="p-5 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-600 mb-2">Chờ thanh toán</p>
            <p className="text-2xl font-bold text-[#111827]">
              {toVND(pendingPayout)}
            </p>
          </Card>
        </div>

        {/* Chart */}
        <Card className="p-5 shadow-sm border border-gray-100 mb-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Biểu đồ Doanh thu
            </h2>
            <p className="text-xs text-gray-500">
              Doanh thu theo ngày trong kỳ đã chọn.
            </p>
          </div>

          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis
                  tickFormatter={(v) =>
                    v >= 1000000
                      ? `${(v / 1000000).toFixed(1)}m`
                      : v >= 1000
                      ? `${Math.round(v / 1000)}k`
                      : `${v}`
                  }
                />
                <Tooltip
                  formatter={(value) => [
                    toVND(Number(value || 0)),
                    "Doanh thu",
                  ]}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-5 shadow-sm border border-gray-100">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-[#111827]">
              Giao dịch gần đây
            </h2>
          </div>

          {filteredForTable.length === 0 ? (
            <p className="text-sm text-gray-500">
              Chưa có giao dịch trong kỳ này.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-md border border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">
                        Booking ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tên Tour
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Tổng tiền
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Trạng thái
                      </th>
                      <th className="text-left py-3 px-4 font-semibold">
                        Ngày
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((b) => (
                      <tr
                        key={b.bookingId}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">
                          #{String(b.bookingId ?? "").replace("#", "")}
                        </td>
                        <td className="py-3 px-4">{b.tour?.title || "N/A"}</td>
                        <td className="py-3 px-4 font-semibold">
                          {toVND(Number(b.totalPrice || 0))}
                        </td>
                        <td className="py-3 px-4">
                          {statusBadge(b.bookingStatus)}
                        </td>
                        <td className="py-3 px-4">
                          {b.bookingDate
                            ? new Date(b.bookingDate).toLocaleDateString(
                                "vi-VN"
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <button
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  ← Trang trước
                </button>

                <p className="text-sm text-gray-600">
                  Trang {page} trên {totalPages}
                </p>

                <button
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Trang sau →
                </button>
              </div>
            </>
          )}
        </Card>
      </div>
    </section>
  );
}
