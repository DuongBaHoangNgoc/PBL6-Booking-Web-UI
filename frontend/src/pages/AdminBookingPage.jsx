import { useEffect, useRef, useState } from "react";
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
  supplierCancelBooking, // ✅ dùng supplier cancel theo dateId
} from "@/api/bookings";

export default function AdminBookingPage() {
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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

  /**
   * ✅ map theo bookingId:
   * { [bookingId]: { dateId, state: 'waiting|active|completed|failed' } }
   */
  const [cancelingMap, setCancelingMap] = useState({});
  const pollersRef = useRef({}); // bookingId -> intervalId (hiện chưa dùng, giữ lại nếu sau này cần)

  const fetchBookings = async (pageArg = page) => {
    const result = await getFilteredBookings({
      page: pageArg,
      limit,
      email: debouncedEmail,
      fullName: debouncedName,
      phoneNumber: debouncedPhone,
      bookingStatus: debouncedStatus,
    });

    const list = result.bookings || [];
    setBookings(list);
    setTotal(result.total || 0);
    return list;
  };

  const handleDelete = async (bookingId) => {
    if (!confirm("Bạn có chắc muốn xóa booking này?")) return;
    try {
      await deleteBooking(bookingId);
      alert("✅ Đã xóa booking!");
      fetchBookings();
    } catch (err) {
      alert(err?.response?.data?.message || "❌ Lỗi khi xóa booking!");
    }
  };

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

  /**
   * ✅ DISABLE hủy nếu booking CONFIRMED nhưng startDate đã qua (quá khứ / đang diễn ra)
   */
  const isPastConfirmed = (b) => {
    if (b?.bookingStatus !== "confirmed") return false;
    const start = b?.date?.startDate;
    if (!start) return false; // không có startDate thì không chặn
    return new Date(start).getTime() <= Date.now();
  };

  /**
   * ✅ Supplier/Admin hủy theo dateId
   * Backend: POST /bookings/SupplierCancelBooking/:dateId
   * Response: { message, jobIds: [{jobId, bookingId}, ...] }
   */
  const handleCancel = async (b) => {
    if (!confirm("Bạn có chắc muốn HỦY booking này?")) return;

    const bookingId = b?.bookingId;
    const dateId = b?.date?.dateId;

    if (!bookingId) return alert("❌ Không tìm thấy bookingId.");
    if (!dateId) return alert("❌ Không tìm thấy dateId trong booking.");

    if (cancelingMap[bookingId]) return;

    try {
      // hiển thị trạng thái tạm
      setCancelingMap((prev) => ({
        ...prev,
        [bookingId]: {
          dateId,
          state: "waiting",
        },
      }));

      // ✅ gọi supplier cancel
      const payload = await supplierCancelBooking(dateId);
      console.log("[SUPPLIER CANCEL]", payload);

      const data = payload?.data ?? payload;
      const jobIdsRaw = data?.jobIds ?? [];

      if (!jobIdsRaw.length) {
        throw new Error("jobIds rỗng");
      }

      // ✅ 1. UPDATE UI NGAY
      setBookings((prev) =>
        prev.map((bk) =>
          bk.bookingId === bookingId ? { ...bk, bookingStatus: "canceled" } : bk
        )
      );

      // ✅ 2. CLEAR trạng thái canceling
      setCancelingMap((prev) => {
        const clone = { ...prev };
        delete clone[bookingId];
        return clone;
      });

      // ✅ 3. Thông báo
      alert("✅ Hủy booking thành công!");

      // ✅ 4. Sync DB (optional)
      setTimeout(() => {
        fetchBookings(page);
      }, 1000);

      // ✅ 5. Clear poller (nếu có)
      stopPolling(bookingId);
    } catch (err) {
      console.error("❌ Supplier cancel error:", err);

      stopPolling(bookingId);

      setCancelingMap((prev) => {
        const clone = { ...prev };
        delete clone[bookingId];
        return clone;
      });

      alert(err?.response?.data?.message || "❌ Hủy booking thất bại!");
    }
  };

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchBookings(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedEmail, debouncedName, debouncedPhone, debouncedStatus]);

  useEffect(() => {
    return () => {
      Object.values(pollersRef.current).forEach((id) =>
        window.clearInterval(id)
      );
      pollersRef.current = {};
    };
  }, []);

  return (
    <section className="min-h-screen my-20 pb-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          All Bookings
        </h1>

        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search by email"
              value={filters.email}
              onChange={(e) =>
                setFilters({ ...filters, email: e.target.value })
              }
            />
            <Input
              placeholder="Search by full name"
              value={filters.fullName}
              onChange={(e) =>
                setFilters({ ...filters, fullName: e.target.value })
              }
            />
            <Input
              placeholder="Search by phone"
              value={filters.phoneNumber}
              onChange={(e) =>
                setFilters({ ...filters, phoneNumber: e.target.value })
              }
            />
            <Select
              onValueChange={(v) =>
                setFilters({ ...filters, bookingStatus: v === "all" ? "" : v })
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

        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Tour</th>

                {/* ✅ thêm cột */}
                <th className="py-3 px-4 font-semibold">Start</th>
                <th className="py-3 px-4 font-semibold">End</th>

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
                  isPastConfirmed(b); // ✅ confirmed nhưng startDate đã qua => disable

                return (
                  <tr
                    key={b.bookingId}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4">{b.bookingId}</td>
                    <td className="py-3 px-4">{b.fullName}</td>
                    <td className="py-3 px-4">{b.email}</td>
                    <td className="py-3 px-4">{b.phoneNumber}</td>
                    <td className="py-3 px-4">{b.tour?.title}</td>

                    <td className="py-3 px-4">
                      {formatDate(b?.date?.startDate)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(b?.date?.endDate)}
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
                      {Number(b.totalPrice).toLocaleString("vi-VN")}₫
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
                                : "Hủy booking (theo ngày)"}
                            </span>
                          </DropdownMenuItem>

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

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>

            <span className="text-sm text-muted-foreground">
              Page {page} / {Math.ceil(total / limit) || 1}
            </span>

            <Button
              variant="outline"
              disabled={page * limit >= total}
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
