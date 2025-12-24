"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hook/useDebounce";
import { useAuth } from "@/context/useAuth";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Trash2, Ban } from "lucide-react";

import {
  getFilteredBookings,
  deleteBooking,
  supplierCancelBookingByIdBooking,
} from "@/api/bookings";

export default function SupplierBookingsPage() {
  const { user } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // ✅ Supplier filter giống Admin + có status
  const [filters, setFilters] = useState({
    email: "",
    fullName: "",
    phoneNumber: "",
    bookingStatus: "",
  });

  const debouncedEmail = useDebounce(filters.email, 500);
  const debouncedName = useDebounce(filters.fullName, 500);
  const debouncedPhone = useDebounce(filters.phoneNumber, 500);
  const debouncedStatus = useDebounce(filters.bookingStatus, 200);

  const limit = 10;

  const [cancelingMap, setCancelingMap] = useState({});
  const pollersRef = useRef({});

  const stopPolling = (bookingId) => {
    const intervalId = pollersRef.current[bookingId];
    if (intervalId) {
      window.clearInterval(intervalId);
      delete pollersRef.current[bookingId];
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString("vi-VN");
    } catch {
      return "—";
    }
  };

  // ✅ disable hủy nếu confirmed nhưng startDate đã qua/đang diễn ra
  const isPastConfirmed = (b) => {
    if (b?.bookingStatus !== "confirmed") return false;
    const start = b?.date?.startDate;
    if (!start) return false;
    return new Date(start).getTime() <= Date.now();
  };

  const fetchBookings = async (pageArg = page) => {
    if (!user?.userId) return;

    const result = await getFilteredBookings({
      page: pageArg,
      limit,

      // ✅ lọc theo supplierId để ra đúng dữ liệu của supplier
      supplierId: user.userId,

      email: debouncedEmail || undefined,
      fullName: debouncedName || undefined,
      phoneNumber: debouncedPhone || undefined,
      bookingStatus: debouncedStatus || undefined,
    });

    // tuỳ backend trả về: result.data.bookings / result.bookings
    const list =
      result?.data?.bookings || result?.bookings || result?.data?.items || [];
    const totalCount =
      result?.data?.total || result?.total || result?.data?.totalItems || 0;

    setBookings(Array.isArray(list) ? list : []);
    setTotal(Number(totalCount) || 0);
    return list;
  };

  const handleDelete = async (bookingId) => {
    if (!confirm("Bạn có chắc muốn xóa booking này?")) return;
    try {
      await deleteBooking(bookingId);
      alert("✅ Đã xóa booking!");
      fetchBookings(page);
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Lỗi khi xóa booking!");
    }
  };

  const handleCancel = async (b) => {
    if (!confirm("Bạn có chắc muốn HỦY booking này?")) return;

    const bookingId = b?.bookingId;
    const dateId = b?.date?.dateId;

    if (!bookingId) return alert("❌ Không tìm thấy bookingId.");
    if (!dateId) return alert("❌ Không tìm thấy dateId trong booking.");

    if (cancelingMap[bookingId]) return;

    try {
      setCancelingMap((prev) => ({
        ...prev,
        [bookingId]: { dateId, state: "waiting" },
      }));

      // ✅ gọi API hủy theo bookingId
      const res = await supplierCancelBookingByIdBooking(bookingId);

      const statusCode = res?.statusCode;
      const message = res?.message;

      if (statusCode && statusCode !== 200 && statusCode !== 201) {
        throw new Error(message || "Hủy booking thất bại!");
      }

      // ✅ update UI ngay
      setBookings((prev) =>
        prev.map((bk) =>
          bk.bookingId === bookingId ? { ...bk, bookingStatus: "canceled" } : bk
        )
      );

      setCancelingMap((prev) => {
        const clone = { ...prev };
        delete clone[bookingId];
        return clone;
      });

      alert("✅ Hủy booking thành công!");
      setTimeout(() => fetchBookings(page), 600);
      stopPolling(bookingId);
    } catch (err) {
      stopPolling(bookingId);
      setCancelingMap((prev) => {
        const clone = { ...prev };
        delete clone[bookingId];
        return clone;
      });

      alert(
        err?.response?.data?.message ||
          err?.message ||
          "❌ Hủy booking thất bại!"
      );
    }
  };

  // ✅ fetch khi page đổi
  useEffect(() => {
    fetchBookings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, user?.userId]);

  // ✅ fetch khi filter debounce đổi
  useEffect(() => {
    setPage(1);
    fetchBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedEmail,
    debouncedName,
    debouncedPhone,
    debouncedStatus,
    user?.userId,
  ]);

  useEffect(() => {
    return () => {
      Object.values(pollersRef.current).forEach((id) =>
        window.clearInterval(id)
      );
      pollersRef.current = {};
    };
  }, []);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total]);

  return (
    <section className="min-h-screen my-20 pb-24">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">All Bookings</h1>
          <div className="text-sm text-muted-foreground">
            Total: <b>{total}</b>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by email"
              value={filters.email}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <Input
              placeholder="Search by full name"
              value={filters.fullName}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
            <Input
              placeholder="Search by phone"
              value={filters.phoneNumber}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, phoneNumber: e.target.value }))
              }
            />
            <Select
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  bookingStatus: v === "all" ? "" : v,
                }))
              }
              value={filters.bookingStatus || "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Booking Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Tour</th>
                <th className="py-3 px-4 font-semibold">Start</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => {
                const cancelInfo = cancelingMap[b.bookingId];
                const isCanceling = !!cancelInfo;

                const disableCancel =
                  b.bookingStatus === "canceled" ||
                  isCanceling ||
                  b.bookingStatus !== "confirmed" ||
                  isPastConfirmed(b);

                return (
                  <tr
                    key={b.bookingId}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">{b.fullName}</td>
                    <td className="py-3 px-4">{b.phoneNumber}</td>
                    <td className="py-3 px-6">{b.tour?.title}</td>

                    <td className="py-3 px-4">
                      {formatDate(b?.date?.startDate)}
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

                      {isCanceling && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Đang hủy… ({cancelInfo.state})
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {Number(b.totalPrice || 0).toLocaleString("vi-VN")}₫
                    </td>

                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() => handleCancel(b)}
                            disabled={disableCancel}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Ban className="h-4 w-4 text-yellow-600" />
                            <span className="text-yellow-700">
                              {isCanceling
                                ? "Đang hủy..."
                                : isPastConfirmed(b)
                                ? "Không thể hủy (quá hạn)"
                                : "Hủy booking"}
                            </span>
                          </DropdownMenuItem>

                          {/* Nếu supplier KHÔNG được xóa booking thì bạn bỏ item này */}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(b.bookingId)}
                            className="cursor-pointer flex items-center gap-2 text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xóa booking
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} / {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
