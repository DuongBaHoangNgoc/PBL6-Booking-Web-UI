// src/services/user.js
import api from "./axiosInstance";

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
    console.log('📤 Calling API to update user:', id);
    const res = await api.patch(`/user/update/${id}`, body);
    console.log('📥 API Response:', res.data);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật user:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
    throw err;
  }
}


/**
 * Lọc thông tin người dùng (ĐÃ SỬA URL)
 * @param {object} queryParams - Ví dụ: { page: 1, limit: 10, fullName: "Test" }
 * @returns {Promise<Object>} Dữ liệu trả về (ví dụ: { items: [], totalItems: 0 })
 */
export async function filterUsers(queryParams) {
  try {
    console.log('📤 Calling API with params:', queryParams);
    const res = await api.get(`/user/FilterPagination`, { params: queryParams });
    console.log('📥 API Response:', res.data);

    // Get data from response
    const data = res.data?.data ?? res.data;

    // Validate data exists
    if (!data) {
      throw new Error('No data received from API');
    }

    // Transform API response to match frontend expected structure
    return {
      items: data.users || [],          // Backend's users array
      totalItems: data.countUser || 0   // Backend's total count
    };

  } catch (err) {
    console.error("❌ Lỗi khi lọc users:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
    throw err;
  }
}

/**
 * Xóa người dùng 
 * @param {number|string} id - ID của người dùng cần xóa
 * @returns {Promise<Object>}
 */
export async function deleteUser(id) {
  try {
    console.log('🗑️ Đang xóa user:', id);
    const res = await api.delete(`/user/${id}`); // Sửa URL endpoint

    console.log('📥 API Response:', res.data);
    return res.data?.data ?? res.data;

  } catch (err) {
    // Log chi tiết lỗi để debug
    console.error("❌ Lỗi khi xóa user:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      config: err.config
    });
    throw err;
  }
}

