import api from "./axiosInstance";

// --------------------- APIs ---------------------

/**
 * Lấy danh sách accounts có phân trang và bộ lọc
 * @param {Object} params - Các tham số lọc
 * @returns {Promise<{accounts: Array, count: number}>}
 */
export async function getAccountsFilterPagination(params = {}) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/accounts/FilterPagination`,
      {
        params: {
          status: params.status || "",
          accountName: params.accountName || "",
          bankName: params.bankName || "",
          accountNumber: params.accountNumber || "",
          userId: params.userId || "",
          limit: params.limit || 10,
          page: params.page || 1,
        },
      }
    );

    // ✅ Giải cấu trúc dữ liệu cho tiện
    const data = response.data?.data || {};
    return {
      accounts: data.accounts || [],
      count: data.countAccounts || 0,
      message: response.data?.message || "",
      statusCode: response.data?.statusCode || 200,
    };
  } catch (error) {
    console.error("❌ Lỗi khi gọi API getAccountsFilterPagination:", error);
    throw error;
  }
}
