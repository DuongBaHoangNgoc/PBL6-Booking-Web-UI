import api from "./axiosInstance";

// Create new coupon
export async function createCoupon(formData) {
    try {
        const res = await api.post("/coupons", formData);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.error("Tạo booking không thành công.", err);
        return [];
    }
}

// Edit coupon 
export async function updateCoupon(couponId, formData) {
    try {
        const res = await api.patch(`/coupons/${couponId}`, formData);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.error(`Lỗi khi cập nhật coupon ${id}:`, err);
        throw err;
    }
}

// Delete Coupon
export async function deleteCoupon(couponId) {
    try {
        const res = await api.delete(`/coupons/${couponId}`);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.error(`Lỗi khi xóa coupon ${couponId}:`, err);
        throw err;
    }
}
/**
 * API SERVICE FUNCTIONS
 */
export async function getCouponsPagination(page = 1, limit = 10, search = "") {
    try {
        const params = {
            page,
            limit,
            title: search || undefined,
        };
        const res = await api.get("/coupons/GetAllPagination", { params });
        return {
            items: res.data?.data?.coupons || [],
            total: res.data?.data?.countCoupons || 0
        };
    } catch (err) {
        console.error("❌ Lỗi fetch coupons:", err);
        throw err;
    }
}


