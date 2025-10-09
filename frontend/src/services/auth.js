import axios from "axios";

const API_URL = "http://localhost:3000/auth";

export const login = async (email, password) => {
  return await axios.post(`${API_URL}/Login`, { email, password });
};

export const getProfile = async (token) => {
  return await axios.get(`${API_URL}/Profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
