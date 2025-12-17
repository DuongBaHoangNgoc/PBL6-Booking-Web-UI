import api from "./axiosInstance";

// Tạo booking mới
export async function createBooking(formData) {
  try {
    const res = await api.post("/bookings", formData);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Tạo booking không thành công.", err);
    return [];
  }
}

// ✅ 1) CHECK tiền hoàn / điều kiện hủy
export async function getPriceBookingCancel(bookingId) {
  try {
    const res = await api.get(`/bookings/getPriceBookingCancel/${bookingId}`);
    return res.data; // { data: { message? | priceToRefund? }, message, statusCode }
  } catch (err) {
    console.error("❌ Lỗi khi gọi getPriceBookingCancel:", err);
    throw err;
  }
}

// ✅ 2) HỦY BOOKING (enqueue queue)
export async function cancelBookingQueued({
  bookingId,
  userId,
  SupplierCancel = false,
}) {
  const res = await api.post(`/bookings/cancelBooking`, {
    bookingId,
    userId,
    SupplierCancel,
  });

  // ✅ trả thẳng { jobId, bookingId }
  return res.data?.data ?? res.data;
}

export async function supplierCancelBooking(dateId) {
  try {
    const res = await api.post(`/bookings/SupplierCancelBooking/${dateId}`);
    // backend bọc ResponseData => res.data.data
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Lỗi khi gọi SupplierCancelBooking:", err);
    throw err;
  }
}

// ✅ 3) CHECK JOB STATUS (poll)
export async function getCancelJobStatus(jobId) {
  const res = await api.get(`/bookings/cancel-status/${jobId}`);
  return res.data; // giữ nguyên wrapper { data, message, statusCode }
}

// 🟢 Lấy toàn bộ booking của người dùng hiện tại
export const getMyBookings = async () => {
  const res = await api.get("/bookings");
  // nếu backend dùng ResponseData => res.data.data mới là mảng
  return res.data?.data ?? [];
};

// Xóa booking theo ID
export async function deleteBooking(bookingId) {
  try {
    const res = await api.delete(`/bookings/${bookingId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi xóa booking:", err);
    throw err;
  }
}

// Cập nhật trạng thái booking (lưu ý: backend bạn gửi đang comment PATCH, nếu chưa mở thì API này sẽ lỗi)
export async function updateBookingStatus(bookingId, status) {
  try {
    const res = await api.patch(`/bookings/${bookingId}`, {
      bookingStatus: status,
    });
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật trạng thái booking:", err);
    throw err;
  }
}

// 🟢 Thanh toán bằng Xu (ghi vào bảng tbl_transaction_coins)
export async function payBookingWithCoin(bookingId, userId, amount) {
  try {
    const res = await api.post(`/bookings/payCoinBooking`, {
      bookingId,
      userId,
      amount,
    });

    const data = res.data?.data ?? res.data;

    return {
      statusCode: res.data?.statusCode,
      status: res.data?.status,
      data,
      message: res.data?.message,
    };
  } catch (err) {
    console.error("❌ Lỗi khi thanh toán bằng xu:", err);
    throw err;
  }
}

// 🟣 Lọc và phân trang danh sách booking
export async function getFilteredBookings(params) {
  try {
    const res = await api.get("/bookings/FilterPagination", { params });

    const bookings = res.data?.data?.bookings || [];
    const total = res.data?.data?.countBookings || 0;

    // (tuỳ bạn) trả luôn total để UI phân trang dễ
    return { bookings, total };
  } catch (err) {
    console.error("❌ Lỗi khi gọi getFilteredBookings:", err);
    return { bookings: [], total: 0 };
  }
}

// Lọc danh sách bookings các tour cho chủ tour
export async function filterBookingBySupplierId(formData) {
  try {
    const res = await api.get("/bookings/FilterPagination", {
      params: formData,
    });
    const data = res.data?.data ?? res.data;

    return {
      items: data.bookings || [],
      totalItems: data.countBookings || 0,
    };
  } catch (err) {
    console.error("Lỗi khi lọc booking theo supplier id.", err);
    throw err;
  }
}
