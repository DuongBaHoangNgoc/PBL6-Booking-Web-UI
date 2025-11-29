import api from "./axiosInstance";

// 🟢 Tạo transaction coin mới (nạp xu / thanh toán / hoàn tiền)
export async function createTransactionCoin(payload) {
  try {
    console.log("📤 Gửi POST /transactions-coins với payload:", payload);
    const res = await api.post("/transactions-coins", payload);
    console.log("✅ Kết quả trả về:", res.data);
    return res.data;
  } catch (err) {
    console.error("❌ Lỗi khi tạo transaction coin:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    throw err;
  }
}
