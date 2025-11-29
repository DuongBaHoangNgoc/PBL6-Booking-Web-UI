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

// 🛑 HỦY BOOKING (đúng API bạn đang dùng)
export async function cancelBooking(bookingId) {
  try {
    const res = await api.post(`/bookings/cancelBooking/${bookingId}`);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi hủy booking:", err);
    throw err;
  }
}

// 🟢 Lấy toàn bộ booking của người dùng hiện tại
export const getMyBookings = async () => {
  const { data } = await api.get("/bookings");
  return data;
};

// Xóa booking theo ID
export async function deleteBooking(bookingId) {
  try {
    console.log("🗑️ Gửi request DELETE /bookings/" + bookingId);
    const res = await api.delete(`/bookings/${bookingId}`);
    console.log("✅ Xóa thành công:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi xóa booking:", err);
    throw err;
  }
}

// Cập nhật trạng thái booking
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
/**
 * Lấy danh sách bookings có thể lọc và phân trang.
 * @param {Object} params - Các tham số lọc
 * @param {string} [params.userId] - ID chủ tour
 * @param {string} [params.bookingStatus] - "pending" | "confirmed" | "cancelled"
 * @param {string} [params.email]
 * @param {string} [params.phoneNumber]
 * @param {string} [params.fullName]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 */
export async function getFilteredBookings(params) {
  try {
    console.log(
      "📡 Gửi request /bookings/FilterPagination với params:",
      params
    );
    const res = await api.get("/bookings/FilterPagination", { params });

    console.log("🟢 Kết quả trả về từ API:", res.data);

    // ✅ Bóc đúng dữ liệu từ cấu trúc thực tế
    const bookings = res.data?.data?.bookings || [];
    const total = res.data?.data?.countBookings || 0;

    console.log("✅ Tổng số booking nhận được:", total);
    console.log("✅ Danh sách booking:", bookings);

    // ✅ Trả về đúng mảng bookings
    return bookings;
  } catch (err) {
    console.error("❌ Lỗi khi gọi getFilteredBookings:", err);
    return [];
  }
}

/**
 * Thanh toán booking
 * @param {Object} payload - Dữ liệu cần gửi
 * @param {number} payload.userId - ID người dùng
 * @param {number} payload.bookingId - ID booking cần thanh toán
 * @param {number} payload.amount - Số xu cần thanh toán
 * @returns {Promise<Object>} - Thông tin booking sau khi thanh toán
 */
export async function payCoinBooking(payload) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/bookings/payCoinBooking`,
      {
        userId: payload.userId,
        bookingId: payload.bookingId,
        amount: payload.amount,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // ✅ API trả về dạng { data: { ...booking... }, message, statusCode }
    const { data, message, statusCode } = response.data;

    return {
      booking: data,
      message,
      statusCode,
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi API payCoinBooking:", error);
    throw error;
  }
}
