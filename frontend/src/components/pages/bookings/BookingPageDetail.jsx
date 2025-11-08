"use client";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  Users,
  ArrowLeft,
  CreditCard,
  XCircle,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BookingDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const booking = location.state?.booking;

  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const userId = booking?.user?.userId || 1;
  const totalPrice = Number(booking?.totalPrice || 0);
  const tour = booking?.tour || {};
  const dateInfo = booking?.date || {};

  if (!booking)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Không tìm thấy thông tin booking (vui lòng quay lại trang trước).
      </div>
    );

  // ✅ Gọi API lấy số dư tài khoản người dùng
  const fetchBalance = async () => {
    try {
      const res = await axios.get(
        `http://localhost:3000/accounts/FilterPagination`,
        {
          params: { userId, limit: 1, page: 1 },
        }
      );
      const account = res.data?.data?.accounts?.[0];
      setBalance(Number(account?.balance || 0));
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Không thể tải số dư tài khoản!" });
    }
  };

  // ✅ Gọi API thanh toán booking bằng xu
  const payCoinBooking = async (payload) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/bookings/payCoinBooking`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data; // { data: {...booking}, message, statusCode }
    } catch (err) {
      console.error("❌ Lỗi khi gọi API payCoinBooking:", err);
      throw err;
    }
  };

  // Mở popup thanh toán
  const handleOpenPayment = async () => {
    setMessage({ type: "", text: "" });
    await fetchBalance();
    setOpen(true);
  };

  // ✅ Xác nhận thanh toán thực tế
  const handleConfirmPayment = async () => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      if (balance < totalPrice) {
        setMessage({
          type: "error",
          text: "Số dư không đủ để thanh toán giao dịch này.",
        });
        setLoading(false);
        return;
      }

      const res = await payCoinBooking({
        userId,
        bookingId: booking.bookingId,
        amount: totalPrice,
      });

      if (res.statusCode === 200 && res.data?.bookingStatus === "confirmed") {
        setMessage({
          type: "success",
          text: "Thanh toán thành công! Đang quay lại danh sách booking...",
        });

        // ✅ Quay lại trang booking sau 1.5 giây
        setTimeout(() => {
          navigate("/bookings");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: res.message || "Thanh toán thất bại, vui lòng thử lại.",
        });
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: "Đã xảy ra lỗi trong quá trình thanh toán.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-6 md:p-14 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Chi tiết đặt tour
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/bookings")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>

        {/* Ảnh + Thông tin tour */}
        <Card className="overflow-hidden mb-6 border border-border shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <img
              src={tour.image || "/placeholder.svg"}
              alt={tour.title || "Không có tiêu đề"}
              className="w-full h-64 object-cover"
            />
            <div className="p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{tour.title}</h2>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4" />
                  <span>{tour.destination || "Đang cập nhật"}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>
                    Ngày đặt:{" "}
                    {new Date(booking.bookingDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {/* Ngày đi / Ngày về */}
                <div className="grid grid-cols-3 gap-4 mt-5 text-center">
                  <div>
                    <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="font-medium">
                      {dateInfo.startDate
                        ? new Date(dateInfo.startDate).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Chưa có"}
                    </p>
                  </div>
                  <div>
                    <Calendar className="w-5 h-5 text-primary mx-auto mb-1" />
                    <p className="font-medium">
                      {dateInfo.endDate
                        ? new Date(dateInfo.endDate).toLocaleDateString("vi-VN")
                        : "Chưa có"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">{`TO${
                      tour.tourId ?? "0000"
                    }`}</p>
                    <p className="text-xs text-muted-foreground">Mã tour</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Tổng cộng</p>
                <p className="text-2xl font-bold text-primary">
                  {totalPrice.toLocaleString("vi-VN")}₫
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin khách hàng */}
        <Card className="p-6 border border-border mb-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Họ tên</p>
              <p className="font-medium">{booking.fullName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{booking.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Số điện thoại</p>
              <p className="font-medium">{booking.phoneNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Địa chỉ</p>
              <p className="font-medium">{booking.address}</p>
            </div>
          </div>
        </Card>

        {/* Chi tiết đặt tour */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Thông tin đặt tour</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Trạng thái</p>
              <p
                className={`font-semibold ${
                  booking.bookingStatus === "confirmed"
                    ? "text-green-600"
                    : booking.bookingStatus === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {booking.bookingStatus}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Số người</p>
              <p className="font-medium flex items-center gap-1">
                <Users className="w-4 h-4 text-primary" />
                {booking.numAdults} người lớn, {booking.numChildren} trẻ em
              </p>
            </div>
          </div>

          {/* ✅ Nếu booking chưa confirmed thì hiển thị nút thanh toán */}
          <div className="flex justify-end mt-8 gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/bookings")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>

            {booking.bookingStatus !== "confirmed" && (
              <Button
                onClick={handleOpenPayment}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán ngay
              </Button>
            )}
          </div>

          {/* ✅ Thông báo nếu đã thanh toán */}
          {booking.bookingStatus === "confirmed" && (
            <p className="text-green-600 font-medium mt-4 text-right flex items-center justify-end gap-2">
              <CheckCircle className="w-4 h-4" />
              Đơn hàng này đã được thanh toán thành công.
            </p>
          )}
        </Card>
      </div>

      {/* Popup thanh toán */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thanh toán</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p>
              <strong>Số dư hiện tại:</strong> {balance.toLocaleString("vi-VN")}{" "}
              đ
            </p>
            <p>
              <strong>Số tiền cần thanh toán:</strong>{" "}
              {totalPrice.toLocaleString("vi-VN")} đ
            </p>

            {message.text && (
              <div
                className={`flex items-center gap-2 text-sm p-3 rounded-md ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>{message.text}</span>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
