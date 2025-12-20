import api from "./axiosInstance";

// --------------------- APIs ---------------------

// GET /tour

// GET /tours
export async function getTours() {
  try {
    const res = await api.get("/tours");
    return {
      data: res.data?.data ?? res.data
    };
  } catch (err) {
    console.error("Lỗi API getTours:", err);
    return [];
  }
}

// GET /tours/:id
export async function getTourById(id) {
  try {
    const res = await api.get(`/tours/${id}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi API getTourById(${id}):`, err);
    return null;
  }
}

export const getTourDetail = getTourById;

// (Giữ lại) GET /tours/search?keyword=...
export async function searchTours(keyword) {
  if (!keyword || !keyword.trim()) return [];
  try {
    const res = await api.get("/tours/search", { params: { keyword } });
    return unwrap(res) ?? [];
  } catch (err) {
    console.error("Lỗi API searchTours:", err);
    return [];
  }
}

/** Lọc theo slug qua FilterPagination */
export async function filterToursBySlug({ slug, page = 1, limit = 10, ...rest }) {
  if (!slug || !String(slug).trim()) {
    console.warn("⚠️ filterToursBySlug: slug bị trống");
    return { items: [], total: 0 };
  }

  try {
    const res = await api.get("/tours/FilterPagination", {
      params: { slug, page, limit, ...rest },
    });

    // ✅ API trả về theo format:
    // { data: { tours: [...], countTour: 2 }, message, statusCode }
    const payload = res?.data?.data ?? {};
    const items = Array.isArray(payload.tours) ? payload.tours : [];
    const total = payload.countTour ?? items.length;

    return { items, total };
  } catch (err) {
    console.error("❌ Lỗi API filterToursBySlug:", err);
    return { items: [], total: 0 };
  }
}


/**
 * Lấy lịch trình (timeline) của tour
 * API: GET /timelines/FilterPagination
 */
export async function getTimelineByTourId(tourId) {
  try {
    const params = {
      tourId: tourId,
      limit: 100,
      page: 1
    };

    const res = await api.get("/timelines/FilterPagination", { params });
    return res.data?.data?.timelines || [];
  } catch (err) {
    console.error(`Lỗi khi tải timeline tour ${tourId}:`, err);
    throw err;
  }
}


/**
 * Lấy đánh giá (reviews) của tour
 * API: GET /reviews/FilterPagination
 */
export async function getReviewsByTourId(tourId) {
  try {
    const params = { tourId, limit: 100, page: 1 };
    const res = await api.get("/reviews/FilterPagination", { params });
    return res.data?.data?.reviews || [];
  } catch (err) {
    console.error(`Lỗi khi tải reviews tour ${tourId}:`, err);
    throw err;
  }
}

/**
 * Lấy toàn bộ danh sách ngày khởi hành 
 * API: GET /start-end-dates
 */
export async function getAllStartDates() {
  try {
    const res = await api.get("/start-end-dates");
    return {
      data: res.data?.data ?? res.data
    };
  } catch (err) {
    console.error("Lỗi API getAllStartDates:", err);
    return [];
  }
}

/**
 * Lấy danh sách ngày khởi hành của tour
 * API: GET /start-end-dates/FilterPagination
 */
export async function getStartDatesByTourId(tourId) {
  try {
    const params = { tourId, limit: 100, page: 1 };
    const res = await api.get("/start-end-dates/FilterPagination", { params });
    return res.data?.data?.startEndDates || [];
  } catch (err) {
    console.error(`Lỗi khi tải ngày khởi hành tour ${tourId}:`, err);
    throw err;
  }
}

/**
 * Lấy giá (thấp nhất/cao nhất) của tour
 * API: GET /start-end-dates/priceTour/{TourId}
 */
export async function getTourPriceById(tourId) {
  try {
    const res = await api.get(`/start-end-dates/priceTour/${tourId}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi tải giá tour ${tourId}:`, err);
    throw err;
  }
}

/**
 * Tạo tour cơ bản (Step 1)
 * API: POST /tours/createTour (dùng FormData)
 * @param {FormData} formData - FormData chứa (title, description, file, ...)
 */
export async function createTour(formData) {
  try {
    const res = await api.post("/tours/createTour", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Lỗi khi tạo tour:", err);
    throw err;
  }
}

/**
 * Thêm một mục lịch trình (Step 2)
 * API: POST /timelines (dùng FormData)
 * @param {FormData} formData - FormData chứa (tourId, tl_title, tl_description, file)
 */
export async function createTimeline(formData) {
  try {
    const res = await api.post("/timelines", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Lỗi khi tạo timeline:", err);
    throw err;
  }
}

/**
 * Thêm ngày khởi hành và giá (Step 3)
 * API: POST /start-end-dates (dùng JSON)
 * @param {object} dateData - Object chứa (tourId, startDate, endDate, priceAdult, ...)
 */
export async function createStartDate(dateData) {
  try {
    const res = await api.post("/start-end-dates", dateData);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Lỗi khi tạo ngày khởi hành:", err);
    throw err;
  }
}

/**
 * Lọc danh sách tour (cho trang Admin/TourList)
 * API: GET /tours/FilterPagination
 * API của bạn trả về { data: { tours: [...], totalItems: X } }
 */
export async function filterTours(queryParams) {
  try {
    const res = await api.get("/tours/FilterPagination", { params: queryParams });
    const data = res.data?.data ?? res.data;

    if (!data) {
      throw new Error('No data received from API');
    }

    return {
      items: data.tours || [],
      totalItems: data.countTour || 0,
    }
  } catch (err) {
    console.error("Lỗi khi lọc tours:", err);
    throw err;
  }
}

/**
 * (MỚI) Thêm nhiều ảnh cho tour
 * API: POST /images/createMutipleImage (dùng FormData)
 */
export async function createImages(formData) {
  try {
    const res = await api.post("/images/createMutipleImage", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error("Lỗi khi thêm ảnh:", err);
    throw err;
  }
}


// === CÁC HÀM CẬP NHẬT (UPDATE - PATCH) ===

/**
 * Cập nhật thông tin cơ bản của tour
 * API: PATCH /tours/{id}
 */
export async function updateTour(id, data) {
  try {
    const res = await api.patch(`/tours/${id}`, data);
    console.log("XP-DEBUG: ", res.data)
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi cập nhật tour ${id}:`, err);
    throw err;
  }
}


/**
 * Cập nhật một mục lịch trình
 * API: PATCH /timelines/{id}
 */
export async function updateTimeline(id, data) {
  try {
    const res = await api.patch(`/timelines/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi cập nhật timeline ${id}:`, err);
    throw err;
  }
}

/**
 * Cập nhật một ngày khởi hành/giá
 * API: PATCH /start-end-dates/{id}
 */
export async function updateStartDate(id, data) {
  try {
    const res = await api.patch(`/start-end-dates/${id}`, data);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi cập nhật ngày khởi hành ${id}:`, err);
    throw err;
  }
}

// === CÁC HÀM XÓA (DELETE) ===

export async function deleteTour(id) {
  try {
    const res = await api.delete(`/tours/${id}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi xóa tour ${id}:`, err);
    throw err;
  }
}

/**
 * Xóa một mục lịch trình
 * API: DELETE /timelines/{id}
 */
export async function deleteTimeline(id) {
  try {
    const res = await api.delete(`/timelines/${id}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi xóa timeline ${id}:`, err);
    throw err;
  }
}

/**
 * Xóa một ngày khởi hành
 * API: DELETE /start-end-dates/{id}
 */
export async function deleteStartDate(id) {
  try {
    const res = await api.delete(`/start-end-dates/${id}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi xóa ngày khởi hành ${id}:`, err);
    throw err;
  }
}

/**
 * (MỚI) Xóa một ảnh
 * API: DELETE /images/{id}
 */
export async function deleteImage(id) {
  try {
    const res = await api.delete(`/images/${id}`);
    return res.data?.data ?? res.data;
  } catch (err) {
    console.error(`Lỗi khi xóa ảnh ${id}:`, err);
    throw err;
  }
}

/**
 * (MỚI) Lấy tất cả ảnh của tour
 * API: GET /images/TourId/{id}
 */
export async function getImagesByTourId(tourId) {
  try {
    const res = await api.get(`/images/TourId/${tourId}`);
    // Giả định API trả về một mảng các object ảnh, 
    // ví dụ: [{ imageId: 1, image: "url1" }, { imageId: 2, image: "url2" }]
    return res.data?.data ?? res.data ?? [];
  } catch (err) {
    console.error(`Lỗi khi tải ảnh tour ${tourId}:`, err);
    return []; // Trả về mảng rỗng nếu lỗi
  }
}


