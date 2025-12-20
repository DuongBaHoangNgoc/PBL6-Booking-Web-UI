import api from "./axiosInstance";

// --------------------- APIs ---------------------

/**
 * Lấy danh sách accounts có phân trang và bộ lọc
 * @param {Object} params - Các tham số lọc
 * @returns {Promise<{accounts: Array, count: number}>}
 */
export async function getAccountsFilterPagination(params = {}) {
  try {
    console.log("📤 Gọi API lấy danh sách accounts với params:", params);

    const res = await api.get(`/accounts/FilterPagination`, {
      params: {
        status: params.status || "",
        accountName: params.accountName || "",
        bankName: params.bankName || "",
        accountNumber: params.accountNumber || "",
        userId: params.userId || "",
        limit: params.limit || 10,
        page: params.page || 1,
      },
    });

    console.log("📥 API Response:", res.data);

    // Lấy dữ liệu từ response
    const data = res.data?.data ?? res.data;

    if (!data) {
      throw new Error("No data received from API");
    }

    // Chuẩn hóa dữ liệu trả về cho frontend
    return {
      accounts: data.accounts || [],
      totalAccounts: data.countAccounts || 0,
      message: res.data?.message || "",
      statusCode: res.data?.statusCode || 200,
    };
  } catch (err) {
    // Log chi tiết lỗi
    console.error("❌ Lỗi khi gọi API getAccountsFilterPagination:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config,
    });
    throw err;
  }
}
// 🟢 Tạo tài khoản ngân hàng mới
export async function createAccount(payload) {
  try {
    const res = await api.post("/accounts", payload);
    console.log("✅ Tạo tài khoản thành công:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi tạo tài khoản:", err);
    throw err;
  }
}
