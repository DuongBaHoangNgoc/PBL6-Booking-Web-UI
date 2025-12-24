"use client";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  CreditCard,
  XCircle,
  CheckCircle,
  Ban,
  Star,
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

// ✅ cancel apis
import {
  getPriceBookingCancel,
  cancelBookingQueued,
  getCancelJobStatus,
} from "@/api/bookings";

// ✅ review apis
import { createReview, getReviewsFilterPagination } from "@/api/reviews";

export default function BookingDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingFromState = location.state?.booking;

  // local booking state để update UI sau khi pay/cancel
  const [booking, setBooking] = useState(bookingFromState || null);

  // Payment dialog
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Cancel flow dialog
  const [openCancel, setOpenCancel] = useState(false);
  const [cancelInfo, setCancelInfo] = useState({
    priceToRefund: null,
    infoText: "",
  });
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelMsg, setCancelMsg] = useState({ type: "", text: "" });

  // poll ref
  const cancelPollRef = useRef(null);

  // ✅ REVIEW state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });
  const [existingReview, setExistingReview] = useState(null);
  const [reviewChecking, setReviewChecking] = useState(false);

  const userId = booking?.user?.userId;
  const totalPrice = Number(booking?.totalPrice || 0);
  const tour = booking?.tour || {};
  const dateInfo = booking?.date || {};

  const endDate = dateInfo?.endDate ? new Date(dateInfo.endDate) : null;
  const isTripCompleted = !!endDate && endDate.getTime() < Date.now();

  useEffect(() => {
    return () => {
      if (cancelPollRef.current) {
        clearInterval(cancelPollRef.current);
      }
    };
  }, []);

  // ✅ check đã review chưa khi trip completed
  useEffect(() => {
    const run = async () => {
      if (!booking) return;
      if (booking.bookingStatus !== "confirmed") return;
      if (!isTripCompleted) return;
      if (!userId || !tour?.tourId) return;

      setReviewChecking(true);
      try {
        // FilterPagination: page, limit, userId, tourId
        const res = await getReviewsFilterPagination({
          page: 1,
          limit: 10,
          userId,
          tourId: tour.tourId,
        });

        // Backend ResponseData: { data: { reviews: [], countReviews }, message, statusCode }
        const reviews = res?.data?.reviews || [];
        if (Array.isArray(reviews) && reviews.length > 0) {
          // nếu backend cho phép nhiều review, lấy cái mới nhất (fallback: cái đầu)
          const r = reviews[0];
          setExistingReview(r);
          // set UI hiển thị đúng rating/comment
          if (typeof r?.rating === "number") setReviewRating(r.rating);
          if (typeof r?.comment === "string") setReviewComment(r.comment);
        } else {
          setExistingReview(null);
        }
      } catch (e) {
        // không chặn UI, chỉ báo nhẹ
        console.warn("⚠️ Cannot check existing review:", e);
      } finally {
        setReviewChecking(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.bookingStatus, isTripCompleted, userId, tour?.tourId]);

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

        // update UI local nếu backend trả booking đã confirmed
        if (res?.data?.bookingStatus) {
          setBooking((prev) => ({
            ...prev,
            bookingStatus: res.data.bookingStatus,
          }));
        }

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

  // =========================
  // ✅ CANCEL FLOW
  // =========================

  // 1) user bấm hủy → gọi getPriceBookingCancel trước
  const handleOpenCancel = async () => {
    setCancelMsg({ type: "", text: "" });
    setCancelInfo({ priceToRefund: null, infoText: "" });

    try {
      const res = await getPriceBookingCancel(booking.bookingId);
      // res = { data, message, statusCode }
      const payload = res?.data;

      // 1) Nếu backend báo không được hủy:
      const denyMsg =
        payload?.message || // message nằm trong data
        (payload === null ? res?.message : null); // hoặc message nằm ở wrapper khi data=null

      if (denyMsg && denyMsg !== "SUCCESS") {
        setOpenCancel(true);
        setCancelInfo({ priceToRefund: null, infoText: denyMsg });
        return;
      }

      // 2) Lấy tiền hoàn (chấp nhận number/string)
      const rawRefund = payload?.priceToRefund;
      const refund =
        rawRefund !== undefined && rawRefund !== null
          ? Number(rawRefund)
          : null;

      if (refund !== null && !Number.isNaN(refund)) {
        setOpenCancel(true);
        setCancelInfo({ priceToRefund: refund, infoText: "" });
        return;
      }

      // fallback
      setOpenCancel(true);
      setCancelInfo({
        priceToRefund: null,
        infoText: "Không lấy được thông tin hoàn tiền. Vui lòng thử lại.",
      });
    } catch (err) {
      console.error("❌ Lỗi handleOpenCancel:", err);
      setOpenCancel(true);
      setCancelInfo({
        priceToRefund: null,
        infoText: "Không thể kiểm tra điều kiện hủy tour. Vui lòng thử lại.",
      });
    }
  };

  // 2) user đồng ý hủy → gọi POST cancelBooking (enqueue) → poll job
  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    setCancelMsg({ type: "", text: "" });

    try {
      const res = await cancelBookingQueued({
        bookingId: booking.bookingId,
        userId,
        SupplierCancel: false,
      });

      // res thường là ResponseData: { data, message, statusCode }
      const jobId =
        res?.data?.jobId ?? res?.jobId ?? res?.data?.data?.jobId ?? null;

      // ✅ Nếu API call chạy tới đây (không throw) => coi như đã gửi yêu cầu hủy
      setCancelMsg({
        type: "success",
        text: jobId
          ? "Đã gửi yêu cầu hủy tour! Đang quay lại danh sách booking..."
          : "Đã gửi yêu cầu hủy tour! Đang quay lại danh sách booking...",
      });

      // ✅ KHÔNG setBookingStatus tại đây (tránh lệch thực tế)
      // vì backend đang xử lý queue, list booking sẽ phản ánh trạng thái thật sau.

      setTimeout(() => {
        setOpenCancel(false);
        navigate("/bookings", { state: { refresh: true } });
      }, 900);
    } catch (err) {
      console.error("❌ Lỗi handleConfirmCancel:", err);
      const serverMsg =
        err?.response?.data?.message ||
        err?.response?.data?.data?.message ||
        "Đã xảy ra lỗi khi gửi yêu cầu hủy.";
      setCancelMsg({ type: "error", text: serverMsg });
    } finally {
      setCancelLoading(false);
    }
  };

  // ✅ Review submit
  const handleSubmitReview = async () => {
    setReviewLoading(true);
    setReviewMsg({ type: "", text: "" });

    try {
      const payload = {
        tourId: tour?.tourId,
        userId,
        rating: Number(reviewRating),
        comment: reviewComment?.trim() || "",
      };

      const res = await createReview(payload);

      if (res?.statusCode === 200 || res?.statusCode === 201 || res?.data) {
        setReviewMsg({
          type: "success",
          text: "Cảm ơn bạn đã đánh giá chuyến đi!",
        });

        // sau khi tạo xong, set existingReview để ẩn form
        const created = res?.data || null;
        setExistingReview(
          created || { rating: payload.rating, comment: payload.comment }
        );
      } else {
        setReviewMsg({
          type: "error",
          text: res?.message || "Gửi đánh giá thất bại, vui lòng thử lại.",
        });
      }
    } catch (err) {
      setReviewMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          err?.response?.data?.data?.message ||
          "Đã xảy ra lỗi khi gửi đánh giá.",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  const canPay =
    booking.bookingStatus !== "confirmed" &&
    booking.bookingStatus !== "canceled";

  // ✅ chỉ cho hủy khi confirmed và CHƯA kết thúc
  const canCancel = booking.bookingStatus === "confirmed" && !isTripCompleted;

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
                    {booking.bookingDate
                      ? new Date(booking.bookingDate).toLocaleDateString(
                          "vi-VN"
                        )
                      : "—"}
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
                      ? `${Number(dateInfo.priceAdult).toLocaleString(
                          "vi-VN"
                        )} ₫`
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Giá trẻ em</p>
                  <p className="font-semibold text-primary">
                    {dateInfo.priceChildren
                      ? `${Number(dateInfo.priceChildren).toLocaleString(
                          "vi-VN"
                        )} ₫`
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
              value={
                booking.bookingDate
                  ? new Date(booking.bookingDate).toLocaleString("vi-VN")
                  : "—"
              }
            />
            <Info
              label="Ngày khởi hành"
              value={
                dateInfo.startDate
                  ? new Date(dateInfo.startDate).toLocaleDateString("vi-VN")
                  : "Chưa có"
              }
            />
            <Info
              label="Ngày kết thúc"
              value={
                dateInfo.endDate
                  ? new Date(dateInfo.endDate).toLocaleDateString("vi-VN")
                  : "Chưa có"
              }
            />

            <Info label="Số người lớn" value={`${booking.numAdults} người`} />
            <Info label="Số trẻ em" value={`${booking.numChildren} người`} />
            <Info label="Mã coupon" value={booking.codeCoupon || "Không có"} />
            <Info
              label="Nhận email xác nhận"
              value={booking.receiveEmail ? "Có" : "Không"}
            />
          </div>

          {/* Tổng tiền */}
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
          <div className="flex justify-end mt-8 gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={() => navigate("/bookings")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </Button>

            {canPay && (
              <Button
                onClick={handleOpenPayment}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Thanh toán ngay
              </Button>
            )}

            {/* ✅ chỉ hiện Hủy tour khi confirmed và chưa kết thúc */}
            {canCancel && (
              <Button
                variant="destructive"
                onClick={handleOpenCancel}
                className="gap-2"
              >
                <Ban className="w-4 h-4" />
                Hủy tour
              </Button>
            )}
          </div>

          {/* ✅ confirmed nhưng chưa kết thúc */}
          {booking.bookingStatus === "confirmed" && !isTripCompleted && (
            <p className="text-green-600 font-medium mt-4 text-right flex items-center justify-end gap-2">
              <CheckCircle className="w-4 h-4" />
              Đơn hàng này đã được thanh toán thành công.
            </p>
          )}

          {/* ✅ completed => review */}
          {booking.bookingStatus === "confirmed" && isTripCompleted && (
            <div className="mt-6 border-t pt-5">
              <p className="text-green-700 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Chuyến đi đã hoàn thành
              </p>

              <div className="mt-4">
                <p className="font-medium mb-2">Đánh giá chuyến đi</p>

                {reviewChecking ? (
                  <p className="text-sm text-muted-foreground">
                    Đang kiểm tra đánh giá...
                  </p>
                ) : existingReview ? (
                  <div className="rounded-md border border-border p-4">
                    <div className="flex items-center gap-2">
                      <StarRating
                        value={Number(existingReview.rating || 0)}
                        readOnly
                      />
                      <span className="text-sm text-muted-foreground">
                        ({existingReview.rating}/5)
                      </span>
                    </div>

                    <p className="mt-3 text-sm">
                      {existingReview.comment
                        ? existingReview.comment
                        : "Không có bình luận."}
                    </p>
                  </div>
                ) : (
                  <>
                    <StarRating
                      value={reviewRating}
                      onChange={setReviewRating}
                    />

                    <div className="mt-3">
                      <textarea
                        className="w-full min-h-[110px] rounded-md border border-border bg-background p-3 text-sm"
                        placeholder="Chia sẻ cảm nhận của bạn về chuyến đi..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                      />
                    </div>

                    {reviewMsg.text && (
                      <div className="mt-3">
                        <AlertMessage message={reviewMsg} />
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        onClick={handleSubmitReview}
                        disabled={reviewLoading}
                      >
                        {reviewLoading ? "Đang gửi..." : "Gửi đánh giá"}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
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

      {/* Popup hủy tour */}
      <Dialog open={openCancel} onOpenChange={setOpenCancel}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Hủy tour</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm">
            {cancelInfo.infoText && (
              <div className="p-3 rounded-md bg-red-50 text-red-700">
                {cancelInfo.infoText}
              </div>
            )}

            {typeof cancelInfo.priceToRefund === "number" && (
              <div className="space-y-2">
                <p>Bạn có chắc muốn hủy tour này không?</p>
                <p>
                  <strong>Số tiền hoàn:</strong>{" "}
                  {cancelInfo.priceToRefund.toLocaleString("vi-VN")} đ
                </p>
                <p className="text-muted-foreground">
                  * Số tiền hoàn phụ thuộc vào thời gian trước ngày khởi hành.
                </p>
              </div>
            )}

            {cancelMsg.text && <AlertMessage message={cancelMsg} />}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpenCancel(false)}>
              Đóng
            </Button>

            {typeof cancelInfo.priceToRefund === "number" && (
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Đang gửi yêu cầu..." : "Xác nhận hủy"}
              </Button>
            )}
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

function StarRating({ value = 5, onChange, readOnly = false }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const active = i <= Number(value || 0);
        return (
          <button
            key={i}
            type="button"
            onClick={() => (!readOnly ? onChange?.(i) : null)}
            className={`p-1 ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            aria-label={`rate-${i}`}
            disabled={readOnly}
          >
            <Star
              className={`w-6 h-6 ${
                active
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        );
      })}
      {!readOnly && (
        <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
      )}
    </div>
  );
}
