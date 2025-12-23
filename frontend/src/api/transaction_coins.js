import api from "./axiosInstance";

/**
 * 🟢 Tạo transaction coin mới (enqueue job)
 * Backend: POST /transactions-coins
 * Payload:
 *  - fromAccount?: number
 *  - toAccount?: number | null
 *  - amount: number
 *  - type: "NAP" | "RUT" | "THANH_TOAN" | "HOAN_TIEN"
 *  - description?: string
 *
 * ResponseData:
 *  { data: { jobId }, message, statusCode }
 */
export async function createTransactionCoin(payload) {
  try {
    console.log("📤 POST /transactions-coins payload:", payload);
    const res = await api.post("/transactions-coins", payload);
    console.log("✅ Response:", res.data);

    // trả nguyên ResponseData để caller tự xử lý
    return res.data;
  } catch (err) {
    console.error("❌ createTransactionCoin error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

/**
 * 📜 Lấy lịch sử thanh toán (transactions-coins) theo supplierId + phân trang
 * Backend: GET /transactions-coins/FilterPagination?page=1&limit=10&supplierId=1
 *
 * ResponseData:
 *  data: {
 *    totalRevenue: number,
 *    TransactionData: TransactionsCoinEntity[],
 *    countTransactionData: number
 *  }
 */
export async function getTransactionsCoinsFilterPagination({
  supplierId,
  page = 1,
  limit = 10,
}) {
  try {
    if (!supplierId || Number.isNaN(Number(supplierId))) {
      throw new Error("supplierId không hợp lệ");
    }

    const res = await api.get("/transactions-coins/FilterPagination", {
      params: { supplierId, page, limit },
    });

    // Trả về nguyên ResponseData
    return res.data;
  } catch (err) {
    console.error("❌ getTransactionsCoinsFilterPagination error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

// ✅ Lọc transactions-coins theo user + phân trang
// GET: /transactions-coins/FilterPaginationUser?page=1&limit=10&userId=1
export const getTransactionsCoinsFilterPaginationUser = async (params) => {
  const { userId, page = 1, limit = 10 } = params || {};

  const res = await api.get("/transactions-coins/FilterPaginationUser", {
    params: { userId, page, limit },
  });

  // res.data = ResponseData (backend)
  return res.data;
};

/**
 * (Optional) Lấy toàn bộ transactions-coins (admin/debug)
 * Backend: GET /transactions-coins
 */
export async function getTransactionsCoinsAll() {
  try {
    const res = await api.get("/transactions-coins");
    return res.data;
  } catch (err) {
    console.error("❌ getTransactionsCoinsAll error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}

/**
 * (Optional) Lấy chi tiết 1 transaction-coin theo id
 * Backend: GET /transactions-coins/:id
 */
export async function getTransactionsCoinById(id) {
  try {
    if (!id) throw new Error("id không hợp lệ");
    const res = await api.get(`/transactions-coins/${id}`);
    return res.data;
  } catch (err) {
    console.error("❌ getTransactionsCoinById error:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}
