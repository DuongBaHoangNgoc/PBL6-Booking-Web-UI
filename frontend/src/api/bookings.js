import api from "./axiosInstance";

export async function createBooking(formData) {
  try {
    const res = await api.post("/bookings", formData);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Tạo booking không thành công.");
    return [];
  }
}

export const getMyBookings = async () => {
  const { data } = await api.get("/bookings");
  return data;
};
