// src/services/tours.js
import axios from "axios";

// Dùng ENV nếu có, mặc định localhost:3000
const BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/+$/, "");

// axios instance (baseURL = root server)
const api = axios.create({ baseURL: BASE });

// Helper unwrap kiểu ResponseData { data, message, statusCode }
const unwrap = (res) => res?.data?.data;

// Helper unwrap list cho FilterPagination (linh hoạt nhiều kiểu payload)
const unwrapList = (res) => {
  const payload = res?.data?.data ?? res?.data ?? {};
  const items = payload.items ?? payload.data ?? payload.rows ?? [];
  const total = payload.total ?? payload.count ?? (Array.isArray(items) ? items.length : 0);
  return { items, total };
};

// --------------------- APIs ---------------------

// GET /tours
export async function getTours(params) {
  const res = await api.get("/tours", { params });
  return unwrap(res) ?? [];
}

// GET /tours/:id
export async function getTourById(id) {
  const res = await api.get(`/tours/${id}`);
  return unwrap(res) ?? null;
}
export const getTourDetail = getTourById;

// POST /tours/createTour (multipart)
export async function createTour(formData) {
  const res = await api.post("/tours/createTour", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return unwrap(res) ?? null;
}

// (Giữ lại) GET /tours/search?keyword=...
export async function searchTours(keyword) {
  if (!keyword || !keyword.trim()) return [];
  try {
    const res = await api.get("/tours/search", { params: { keyword } });
    return unwrap(res) ?? [];
  } catch (err) {
    console.error("Lỗi API searchTours:", err);
    return [];
  }
}

/** ✅ MỚI: lọc theo slug qua FilterPagination
 * Backend của bạn nhận các param: slug, page, limit, (có thể thêm destination/domain/status/time...)
 */
export async function filterToursBySlug({ slug, page = 1, limit = 10, ...rest }) {
  if (!slug || !String(slug).trim()) {
    console.warn("⚠️ filterToursBySlug: slug bị trống");
    return { items: [], total: 0 };
  }

  try {
    const res = await api.get("/tours/FilterPagination", {
      params: { slug, page, limit, ...rest },
    });

    // ✅ API trả về theo format:
    // { data: { tours: [...], countTour: 2 }, message, statusCode }
    const payload = res?.data?.data ?? {};
    const items = Array.isArray(payload.tours) ? payload.tours : [];
    const total = payload.countTour ?? items.length;

    return { items, total };
  } catch (err) {
    console.error("❌ Lỗi API filterToursBySlug:", err);
    return { items: [], total: 0 };
  }
}
