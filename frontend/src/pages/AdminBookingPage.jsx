import { useEffect, useState } from "react";
import axios from "axios";
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

import { deleteBooking, cancelBooking } from "@/api/bookings";

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

  const fetchBookings = async () => {
    const params = new URLSearchParams({
      page,
      limit,
      email: debouncedEmail,
      fullName: debouncedName,
      phoneNumber: debouncedPhone,
      bookingStatus: debouncedStatus,
    });

    const res = await axios.get(
      `http://localhost:3000/bookings/FilterPagination?${params.toString()}`
    );

    setBookings(res.data.data.bookings);
    setTotal(res.data.data.countBookings || 0);
  };

  // ❌ Xóa booking
  const handleDelete = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa booking này?")) return;

    try {
      await deleteBooking(id);
      alert("Đã xóa booking!");
      fetchBookings();
    } catch (err) {
      alert("Lỗi khi xóa booking!");
    }
  };

  // 🛑 Hủy booking
  const handleCancel = async (id) => {
    if (!confirm("Bạn có chắc muốn HỦY booking này?")) return;

    try {
      await cancelBooking(id);
      alert("Đã hủy booking!");
      fetchBookings();
    } catch (err) {
      alert("Hủy booking thất bại!");
    }
  };

  // Khi đổi trang → gọi API
  useEffect(() => {
    fetchBookings();
  }, [page]);

  // Khi filter thay đổi → luôn reset về page 1 + gọi API
  useEffect(() => {
    setPage(1);
    fetchBookings();
  }, [debouncedEmail, debouncedName, debouncedPhone, debouncedStatus]);

  return (
    <section className="min-h-screen my-20 pb-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-foreground">
          All Bookings
        </h1>

        {/* Bộ lọc */}
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
                setFilters({
                  ...filters,
                  bookingStatus: v === "all" ? "" : v,
                })
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

        {/* Bảng Booking */}
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Full Name</th>
                <th className="py-3 px-4 font-semibold">Email</th>
                <th className="py-3 px-4 font-semibold">Phone</th>
                <th className="py-3 px-4 font-semibold">Tour</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Price</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bookings.map((b) => (
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

                  <td className="py-3 px-4">
                    {Number(b.totalPrice).toLocaleString("vi-VN")}₫
                  </td>

                  {/* Dropdown Actions */}
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

                        {/* HỦY BOOKING */}
                        <DropdownMenuItem
                          onClick={() => handleCancel(b.bookingId)}
                          disabled={b.bookingStatus === "canceled"}
                          className="cursor-pointer flex items-center gap-2"
                        >
                          <Ban className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-700">Hủy booking</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* XÓA BOOKING */}
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
              ))}
            </tbody>
          </table>

          {/* Phân trang */}
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
