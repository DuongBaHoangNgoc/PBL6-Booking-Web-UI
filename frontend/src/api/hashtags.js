import api from "./axiosInstance";
import slugify from "slugify";

// Hàm helper để format hashtag (như bạn yêu cầu)
const formatHashtag = (text) => {
    const cleaned = text.replace(/#/g, "").trim();
    if (!cleaned) return null;
    const slug = slugify(cleaned, {
        lower: true,
        strict: true,
        locale: 'vi'
    });
    const formatted = slug.replace(/-/g, '');
    return `#${formatted}`;
};

// Hàm lấy danh sách hashtags
export async function filterHashtags(params) {
    try {
        const res = await api.get("/hashtags/FilterPagination", params);
        return res.data?.data || [];
    } catch (err) {
        console.log("Lỗi khi lọc hashtags: ", err);
        return [];
    }
}

// Tạo một hashtag mới 
export async function createHashtag(data) {
    try {
        const formattedName = formatHashtag(data.name);
        if (!formattedName) throw new Error("Tên hashtag không hợp lệ");

        const payload = {
            name: formattedName,
            description: data.description || data.name
        };

        const res = await api.post("/hashtags", payload);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.error("Lỗi khi tạo hashtag:", err);
        throw err;
    }
}

// Gắn link 1 hashtag vào 1 tour
export async function linkTourToHashTag(data) {
    try {
        const res = await api.post("/tour-hashtags", data);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.log("Lỗi khi gắn hashtag vào tour: ", err);
        throw err;
    }
}

/**
 * Lấy các hashtag ĐÃ GẮN VÀO TOUR
 * API: GET /tour-hashtags/FilterPagination
 * @param {string|number} tourId - ID của tour
 */
export async function getHashtagsForTour(tourId) {
    try {
        const params = { tourId, limit: 100, page: 1 };
        const res = await api.get("/tour-hashtags/FilterPagination", { params });
        // Giả định API trả về { data: [ { tourHashTagId, hashtag: { hashtagId, name } } ] }
        return res.data?.data ?? res.data ?? [];
    } catch (err) {
        console.error("Lỗi khi tải hashtags cho tour:", err);
        return [];
    }
}

/**
 * Xóa (unlink) một hashtag khỏi tour
 * API: DELETE /tour-hashtags/{id}
 * @param {string|number} tourHashTagId - ID của BẢN GHI LIÊN KẾT (không phải hashtagId)
 */
export async function deleteTourHashtag(tourHashTagId) {
    try {
        const res = await api.delete(`/tour-hashtags/${tourHashTagId}`);
        return res.data?.data ?? res.data;
    } catch (err) {
        console.error(`Lỗi khi xóa link tour-hashtag ${tourHashTagId}:`, err);
        throw err;
    }
}

