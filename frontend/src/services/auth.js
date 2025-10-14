import axios from "axios";

const API_URL = "http://localhost:3000/auth";

// ✅ Tạo một instance của axios để dễ quản lý
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🧠 Interceptor: tự động thêm token vào mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🧩 Interceptor: tự động làm mới access_token khi hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi là 401 và chưa thử refresh
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) throw new Error("No refresh token");

        // 🔁 Gọi API refresh token
        const res = await axios.post(`${API_URL}/refresh-token`, {
          refreshToken,
        });

        const { access_token } = res.data;
        if (access_token) {
          localStorage.setItem("access_token", access_token);
          // Gửi lại request cũ với token mới
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login"; // Đăng xuất tự động
      }
    }
    return Promise.reject(error);
  }
);

// 🧩 Gọi API đăng nhập
export const login = async (email, password) => {
  return await api.post("/Login", { email, password });
};

// 🧩 Lấy thông tin profile người dùng
export const getProfile = async () => {
  return await api.get("/Profile");
};

export default api;
