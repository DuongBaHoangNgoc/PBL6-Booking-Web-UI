import api from "./axiosInstance";

/**
 * 🪙 Tạo transaction in/out coin mới
 * @param {Object} payload - Thông tin giao dịch
 * @param {number} payload.userWalletAccountId - ID tài khoản ví người dùng
 * @param {number} payload.amount - Số tiền nạp/rút
 * @param {"NAP_TIEN" | "RUT_TIEN"} payload.type - Loại giao dịch (nạp hoặc rút)
 * @returns {Promise<Object>} Dữ liệu giao dịch sau khi tạo
 */
export const createTransaction = async (payload) => {
  try {
    const res = await api.post("/transactions/InOutcoin", payload);
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo transaction:", error);
    throw error;
  }
};

/**
 * 📜 Lấy danh sách lịch sử giao dịch (có phân trang và lọc)
 * @param {Object} params - Tham số lọc và phân trang
 * @param {number} params.userWalletAccountId - ID ví người dùng (tuỳ chọn)
 * @param {string} params.type - Loại giao dịch ("NAP_TIEN", "RUT_TIEN") (tuỳ chọn)
 * @param {number} [params.page=1] - Trang hiện tại
 * @param {number} [params.limit=10] - Số giao dịch mỗi trang
 * @returns {Promise<Object>} Danh sách giao dịch và tổng số
 */
export const getTransactions = async (params = {}) => {
  try {
    const res = await api.get("/transactions/FilterPagination", { params });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách transaction:", error);
    throw error;
  }
};

/**
 * 💸 Tạo transaction rút tiền (PENDING)
 * Backend: POST /transactions/RutTien
 * @param {Object} payload
 * @param {number} payload.userWalletAccountId
 * @param {number} payload.amount
 * @returns {Promise<Object>}
 */
export const createWithdrawTransaction = async (payload) => {
  try {
    const res = await api.post("/transactions/RutTien", {
      ...payload,
      type: "RUT_TIEN", // theo controller yêu cầu type = RUT_TIEN
    });
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo transaction rút tiền:", error);
    throw error;
  }
};

/**
 * ✅ Xác nhận rút tiền & cập nhật số dư theo transactionId
 * Backend: POST /transactions/UpdateBalanceRutTien/:id
 * @param {number|string} transactionId
 * @returns {Promise<Object>}
 */
export const confirmWithdrawAndUpdateBalance = async (transactionId) => {
  try {
    const res = await api.post(
      `/transactions/UpdateBalanceRutTien/${transactionId}`
    );
    return res.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật số dư rút tiền:", error);
    throw error;
  }
};
