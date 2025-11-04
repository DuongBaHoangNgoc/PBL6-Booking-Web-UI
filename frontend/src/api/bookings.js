import api from "./axiosInstance";

export const createBooking = async (payload) => {
  const { data } = await api.post("/bookings", payload);
  return data;
};

export const getMyBookings = async () => {
  const { data } = await api.get("/bookings");
  return data;
};
