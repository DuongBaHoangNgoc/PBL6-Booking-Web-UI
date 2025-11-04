import api from "./axiosInstance";

export const login = async (email, password) => {
  return await api.post("/auth/Login", { email, password });
};

export const getProfile = async () => {
  return await api.get("/auth/Profile");
};
