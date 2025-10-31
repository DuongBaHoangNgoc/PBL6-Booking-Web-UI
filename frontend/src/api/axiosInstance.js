import axios from "axios";
import { getProfile } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // đọc từ .env
  // headers: { "Content-Type": "application/json" },
});

let contextSetters = {};

export const injectContextSetters = (setToken, logout) => {
  contextSetters.setToken = setToken;
  contextSetters.logout = logout;
}

// Đính kèm access token nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự refresh token nếu 401
api.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const original = err.config;
    const refreshToken = localStorage.getItem("refresh_token");

    // Nếu lỗi là 401, token hết hạn và chúng ta có refresh token
    // và request chưa được thử lại
    if (err.response?.status === 401 && refreshToken && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return Promise.reject(err);

      try {
        const r = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { refresh_token: refresh }
        );

        const newAccess = r.data?.access_token;

        localStorage.setItem("access_token", newAccess);
        if (contextSetters.setToken) {
          contextSetters.setToken(newAccess);
        }

        // Thử lại request ban đầu với access token mới
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);

      } catch (e) {
        // refresh thất bại -> buộc logout
        // localStorage.removeItem("access_token");
        // localStorage.removeItem("refresh_token");

        // Nếu refresh token cũng thất bại (ví dụ: hết hạn)
        console.error("Refresh token failed, logging out.", refreshError);
        if (contextSetters.logout) {
          contextSetters.logout();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  }
);

export default api;
