// src/services/tours.js
import axios from "axios";

// Dùng ENV nếu có, mặc định localhost:3000
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(
  /\/+$/,
  ""
);

// Tạo axios instance, baseURL = root server (KHÔNG kèm /tours)
const api = axios.create({
  baseURL: BASE,
  // withCredentials: true, // nếu server cần cookie
});

// Helper unwrap ResponseData
const unwrap = (res) => res?.data?.data;

// --------------------- APIs ---------------------

// GET /tours  (danh sách)
export async function getTours(params) {
  const res = await api.get("/tours", { params });
  return unwrap(res) ?? [];
}

// GET /tours/:id  (chi tiết + relations do BE trả)
export async function getTourById(id) {
  const res = await api.get(`/tours/${id}`);
  return unwrap(res) ?? null;
}

// Alias nếu bạn cần tên khác
export const getTourDetail = getTourById;

// POST /tours/createTour  (form-data upload ảnh)
export async function createTour(formData) {
  const res = await api.post("/tours/createTour", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res) ?? null;
}

// GET /tours/search?keyword=...
export async function searchTours(keyword) {
  if (!keyword || !keyword.trim()) return [];
  try {
    const res = await api.get("/tours/search", {
      params: { keyword },
    });
    return unwrap(res) ?? [];
  } catch (err) {
    console.error("Lỗi API searchTours:", err);
    return [];
  }
}
