import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // đọc từ .env
  headers: { "Content-Type": "application/json" },
});

// Đính kèm access token nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tự refresh token nếu 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem("refresh_token");
      if (!refresh) return Promise.reject(err);
      try {
        const r = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
          { refresh_token: refresh }
        );
        const newAccess = r.data?.access_token;
        if (newAccess) {
          localStorage.setItem("access_token", newAccess);
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (e) {
        // refresh thất bại -> buộc logout
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }
    return Promise.reject(err);
  }
);

export default api;
