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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getAccountsFilterPagination } from "@/api/wallet_accounts";
import { payBookingWithCoin } from "@/api/bookings";

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

  // ✅ Lấy số dư tài khoản người dùng
  const fetchBalance = async () => {
    try {
      const res = await getAccountsFilterPagination({
        userId,
        limit: 1,
        page: 1,
      });

      const account = res.accounts?.[0];
      setBalance(Number(account?.balance || 0));
    } catch (err) {
      console.error("❌ Lỗi khi tải số dư tài khoản:", err);
      setMessage({ type: "error", text: "Không thể tải số dư tài khoản!" });
    }
  };

  // ✅ Mở popup thanh toán
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

      const res = await payBookingWithCoin(
        booking.bookingId,
        userId,
        totalPrice
      );

      if (
        res?.statusCode === 200 ||
        res?.status === "SUCCESS" ||
        res?.data?.bookingStatus === "confirmed"
      ) {
        setMessage({
          type: "success",
          text: "Thanh toán thành công! Đang quay lại danh sách booking...",
        });
        setTimeout(() => navigate("/bookings"), 1500);
      } else {
        setMessage({
          type: "error",
          text: res?.message || "Thanh toán thất bại, vui lòng thử lại.",
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

        {/* Thông tin tour */}
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

                {/* Ngày đi / về */}
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

              {/* Giá vé người lớn / trẻ em */}
              <div className="grid grid-cols-2 gap-4 mt-4 text-center border-t pt-3">
                <div>
                  <p className="text-sm text-muted-foreground">Giá người lớn</p>
                  <p className="font-semibold text-primary">
                    {dateInfo.priceAdult
                      ? `${dateInfo.priceAdult.toLocaleString("vi-VN")} ₫`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá trẻ em</p>
                  <p className="font-semibold text-primary">
                    {dateInfo.priceChildren
                      ? `${dateInfo.priceChildren.toLocaleString("vi-VN")} ₫`
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Thông tin khách hàng */}
        <Card className="p-6 border border-border mb-6">
          <h3 className="text-lg font-semibold mb-4">Thông tin khách hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="Họ tên" value={booking.fullName} />
            <Info label="Email" value={booking.email} />
            <Info label="Số điện thoại" value={booking.phoneNumber} />
            <Info label="Địa chỉ" value={booking.address} />
          </div>
        </Card>

        {/* Chi tiết đặt tour */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Thông tin đặt tour</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <Info label="Trạng thái">
              <span
                className={`font-semibold ${
                  booking.bookingStatus === "confirmed"
                    ? "text-green-600"
                    : booking.bookingStatus === "pending"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {booking.bookingStatus}
              </span>
            </Info>

            <Info
              label="Ngày đặt"
              value={new Date(booking.bookingDate).toLocaleString("vi-VN")}
            />
            <Info
              label="Ngày khởi hành"
              value={new Date(dateInfo.startDate).toLocaleDateString("vi-VN")}
            />
            <Info
              label="Ngày kết thúc"
              value={new Date(dateInfo.endDate).toLocaleDateString("vi-VN")}
            />

            <Info label="Số người lớn" value={`${booking.numAdults} người`} />

            <Info label="Số trẻ em" value={`${booking.numChildren} người`} />

            <Info label="Mã coupon" value={booking.codeCoupon || "Không có"} />
            <Info
              label="Nhận email xác nhận"
              value={booking.receiveEmail ? "Có" : "Không"}
            />
          </div>

          {/* 💰 Tổng tiền */}
          <div className="p-4 flex justify-between items-center mb-6 shadow-sm">
            <div>
              <p className="font-medium text-gray-700">Tổng tiền</p>
              <p className="text-sm text-gray-500">
                {booking.numAdults} người lớn + {booking.numChildren} trẻ em
              </p>
            </div>
            <p className="text-3xl font-bold text-primary">
              {totalPrice.toLocaleString("vi-VN")} ₫
            </p>
          </div>

          {/* Nút hành động */}
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

            {message.text && <AlertMessage message={message} />}
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

function Info({ label, value, children }) {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="font-medium">{children || value}</p>
    </div>
  );
}

function AlertMessage({ message }) {
  return (
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
  );
}
