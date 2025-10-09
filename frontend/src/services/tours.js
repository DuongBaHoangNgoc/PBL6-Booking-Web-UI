import api from "../api/axios";

export const getTours = async (params) => {
  const { data } = await api.get("/tours", { params });
  return data;
};

export const getTourDetail = async (id) => {
  const { data } = await api.get(`/tours/${id}`);
  return data;
};

// Upload ảnh tour nếu backend yêu cầu form-data:
export const createTour = async (formData) => {
  const { data } = await api.post("/tours/createTour", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};
