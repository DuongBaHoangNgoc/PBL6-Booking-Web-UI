import api from "./axiosInstance";

// ✅ Tạo review (cần token)
export const createReview = async ({ tourId, userId, rating, comment }) => {
  const res = await api.post("/reviews", { tourId, userId, rating, comment });
  return res.data;
};

// ✅ Lấy tất cả reviews
export const getAllReviews = async () => {
  const res = await api.get("/reviews");
  return res.data;
};

// ✅ Lấy reviews phân trang: /reviews/GetAllPagination?page=1&limit=10
export const getAllReviewsPagination = async (page = 1, limit = 10) => {
  const res = await api.get("/reviews/GetAllPagination", {
    params: { page, limit },
  });
  return res.data;
};

// ✅ Lọc reviews phân trang: /reviews/FilterPagination?page=1&limit=10&userId=&tourId=&rating=
export const getReviewsFilterPagination = async ({
  page = 1,
  limit = 10,
  userId,
  tourId,
  rating,
} = {}) => {
  const res = await api.get("/reviews/FilterPagination", {
    params: { page, limit, userId, tourId, rating },
  });
  return res.data;
};

// ✅ Lấy 1 review theo id
export const getReviewById = async (id) => {
  const res = await api.get(`/reviews/${id}`);
  return res.data;
};

// ✅ Update review (cần token)
export const updateReview = async (id, payload) => {
  // payload theo UpdateReviewDto backend (vd: rating, comment...)
  const res = await api.patch(`/reviews/${id}`, payload);
  return res.data;
};

// ✅ Xóa review (cần token)
export const deleteReview = async (id) => {
  const res = await api.delete(`/reviews/${id}`);
  return res.data;
};
