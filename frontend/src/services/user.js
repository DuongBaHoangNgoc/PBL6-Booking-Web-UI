// src/services/user.js
import api from "../api/axios";

/**
 * Lấy thông tin người dùng theo ID
 * @param {number|string} id
 * @returns {Promise<Object>} dữ liệu user
 */
export async function getUserById(id) {
  try {
    const res = await api.get(`/user/${id}`);
    return res.data?.data ?? res.data; // hỗ trợ cả { data: {...} }
  } catch (err) {
    console.error("❌ Lỗi khi lấy user:", err);
    throw err;
  }
}

/**
 * Cập nhật thông tin người dùng
 * @param {number|string} id
 * @param {Object} body - dữ liệu cập nhật
 * @returns {Promise<Object>} user sau khi cập nhật
 */
export async function updateUser(id, body) {
  try {
    const res = await api.patch(`/user/update/${id}`, body);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật user:", err);
    throw err;
  }
}
