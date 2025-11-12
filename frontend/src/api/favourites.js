import api from "./axiosInstance";

// 🩷 Thêm vào yêu thích
export const addToFavorites = async (userId, tourId) => {
  const res = await api.post(`/favourites`, { userId, tourId });
  return res.data;
};

// 🩵 Lấy danh sách yêu thích (phân trang)
export const getFavorites = async (userId, page = 1, limit = 10) => {
  const res = await api.get(`/favourites/FilterPagination`, {
    params: { userId, page, limit },
  });
  return res.data;
};

// ❌ Xóa khỏi danh sách yêu thích
export const deleteFavorite = async (favouriteId) => {
  const res = await api.delete(`/favourites/${favouriteId}`);
  return res.data;
};
