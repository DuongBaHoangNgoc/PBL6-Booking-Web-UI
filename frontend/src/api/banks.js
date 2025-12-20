export const getBanks = async () => {
  try {
    const res = await fetch("https://api.vietqr.io/v2/banks");
    const data = await res.json();
    if (data.code !== "00") throw new Error("API bank error");

    return data.data; // danh sách ngân hàng
  } catch (err) {
    console.error("❌ Lỗi lấy danh sách ngân hàng:", err);
    return [];
  }
};
