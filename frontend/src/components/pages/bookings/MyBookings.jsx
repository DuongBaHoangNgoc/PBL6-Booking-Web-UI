"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Trash2, Heart, Edit3 } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { getFilteredBookings, deleteBooking } from "@/api/bookings";
import { addToFavorites, getFavorites } from "@/api/favourites";
import { useNavigate, useLocation } from "react-router-dom";

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favLoading, setFavLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [editMode, setEditMode] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // ✅ Fetch bookings (tách ra để có thể gọi lại khi quay về từ detail)
  const fetchBookings = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const res = await getFilteredBookings({
        userId: user.userId,
        limit,
        page,
      });

      const list = res?.bookings ?? [];

      const normalized = list.map((b) => ({
        ...b,
        date: b.date || { startDate: null, endDate: null },
      }));

      setBookings(normalized);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách booking:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch favourites
  const fetchFavorites = async () => {
    if (!user) return;

    try {
      setFavLoading(true);
      const res = await getFavorites(user.userId, 1, 10);
      // 🩷 API trả về ở res.data.favourites (tuỳ backend), bạn đang dùng res.data.favourites
      setFavorites(res?.data?.favourites || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách yêu thích:", err);
    } finally {
      setFavLoading(false);
    }
  };

  // 🧭 Load lần đầu + khi user/page đổi
  useEffect(() => {
    if (!user) return;
    fetchBookings();
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page]);

  // ✅ Khi quay lại từ BookingDetail và truyền state.refresh
  // Vì cancel chạy queue nên refetch 2-3 lần để chắc đã cập nhật
  useEffect(() => {
    if (!user) return;
    if (!location.state?.refresh) return;

    fetchBookings();
    const t1 = setTimeout(fetchBookings, 800);
    const t2 = setTimeout(fetchBookings, 2000);

    // ✅ xóa state refresh để không bị refetch lại lần sau
    window.history.replaceState({}, document.title);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, user]);

  // ⚙️ Lọc và sắp xếp bookings
  const filteredBookings =
    selectedStatus === "All"
      ? bookings
      : bookings.filter(
          (b) => b.bookingStatus === selectedStatus.toLowerCase()
        );

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const priceA = Number(a.totalPrice) || 0;
    const priceB = Number(b.totalPrice) || 0;
    switch (sortBy) {
      case "Price: Low to High":
        return priceA - priceB;
      case "Price: High to Low":
        return priceB - priceA;
      case "Newest":
      default:
        return new Date(b.bookingDate) - new Date(a.bookingDate);
    }
  });

  // 💖 Thêm vào yêu thích (gọi API + reload)
  const handleAddToFavorites = async () => {
    if (selectedBookings.length === 0) return alert("Chưa chọn booking nào!");
    if (!user) return alert("Bạn cần đăng nhập!");

    try {
      for (const id of selectedBookings) {
        const booking = bookings.find((b) => b.bookingId === id);
        if (booking?.tour?.tourId) {
          await addToFavorites(user.userId, booking.tour.tourId);
        }
      }

      alert("✅ Đã thêm vào danh sách yêu thích!");
      setSelectedBookings([]);
      setEditMode(false);

      // ✅ Reload lại danh sách yêu thích
      const res = await getFavorites(user.userId, 1, 10);
      setFavorites(res?.data?.favourites || []);
    } catch (err) {
      console.error("❌ Lỗi khi thêm yêu thích:", err);
      alert("Không thể thêm tour vào danh sách yêu thích.");
    }
  };

  // 🗑️ Xóa booking
  const handleDeleteBookings = async () => {
    if (selectedBookings.length === 0) return alert("Chưa chọn booking nào!");
    if (!window.confirm("Bạn có chắc muốn xóa những booking này không?"))
      return;

    try {
      await Promise.all(selectedBookings.map((id) => deleteBooking(id)));
      alert(`🗑️ Đã xóa ${selectedBookings.length} booking thành công!`);

      setBookings((prev) =>
        prev.filter((b) => !selectedBookings.includes(b.bookingId))
      );

      setSelectedBookings([]);
      setEditMode(false);
    } catch (err) {
      console.error("❌ Lỗi khi xóa booking:", err);
      alert("Không thể xóa booking. Vui lòng thử lại.");
    }
  };

  // 🕓 Loading
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải danh sách đặt tour...
      </div>
    );

  return (
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* 🧭 Sidebar */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Trạng thái</h3>
              <div className="space-y-2">
                {["All", "Pending", "Confirmed", "Cancelled"].map((status) => (
                  <label
                    key={status}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={(e) => {
                        setSelectedStatus(e.target.value);
                        setPage(1);
                      }}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* 📋 Nội dung chính */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                My Bookings ({sortedBookings.length})
              </h2>

              <Button variant="outline" onClick={() => setEditMode(!editMode)}>
                <Edit3 className="w-4 h-4 mr-2" />
                {editMode ? "Hoàn tất" : "Sửa"}
              </Button>
            </div>

            {/* Hành động khi bật chế độ sửa */}
            {editMode && (
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={handleAddToFavorites}
                  disabled={selectedBookings.length === 0}
                >
                  <Heart className="w-4 h-4 mr-2 text-pink-500" /> Thêm vào yêu
                  thích
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteBookings}
                  disabled={selectedBookings.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Xóa tour
                </Button>
              </div>
            )}

            {/* Danh sách booking */}
            {sortedBookings.length > 0 ? (
              <div className="space-y-4">
                {sortedBookings.map((b) => {
                  const isSelected = selectedBookings.includes(b.bookingId);
                  const tour = b.tour || {};

                  return (
                    <Card
                      key={b.bookingId}
                      onClick={() =>
                        !editMode &&
                        navigate(`/bookings/${b.bookingId}`, {
                          state: { booking: b },
                        })
                      }
                      className={`overflow-hidden border ${
                        isSelected ? "border-primary" : "border-border"
                      } hover:shadow-md transition cursor-pointer`}
                    >
                      <div className="flex gap-4 p-4 items-center">
                        {editMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              setSelectedBookings((prev) =>
                                e.target.checked
                                  ? [...prev, b.bookingId]
                                  : prev.filter((id) => id !== b.bookingId)
                              );
                            }}
                            className="w-5 h-5 accent-primary"
                          />
                        )}

                        <div className="relative w-48 h-40 rounded-lg overflow-hidden">
                          <img
                            src={tour.image || "/placeholder.svg"}
                            alt={tour.title || "Không có tiêu đề"}
                            className="w-full h-full object-cover hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              {tour.title || "Chưa có thông tin tour"}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{tour.destination || "Đang cập nhật"}</span>
                            </div>
                            <p className="text-sm mt-1">
                              Ngày đặt:{" "}
                              {new Date(b.bookingDate).toLocaleDateString(
                                "vi-VN"
                              )}
                            </p>
                            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>
                                  {b.date?.startDate
                                    ? new Date(
                                        b.date.startDate
                                      ).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày đi"}
                                </span>
                              </div>
                              <span>→</span>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-primary" />
                                <span>
                                  {b.date?.endDate
                                    ? new Date(
                                        b.date.endDate
                                      ).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày về"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                b.bookingStatus === "confirmed"
                                  ? "bg-green-100 text-green-700"
                                  : b.bookingStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {b.bookingStatus}
                            </span>
                            <p className="text-lg font-bold text-primary">
                              {Number(b.totalPrice).toLocaleString("vi-VN")}₫
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12 text-center border border-border">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Không có tour nào phù hợp
                </h3>
              </Card>
            )}

            {/* 💖 Tour yêu thích */}
            <div className="mt-10">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Danh sách tour yêu thích ({favorites.length})
              </h3>

              {favLoading ? (
                <p className="text-muted-foreground">Đang tải danh sách...</p>
              ) : favorites.length === 0 ? (
                <Card className="p-8 text-center border border-border text-muted-foreground">
                  Chưa có tour yêu thích nào.
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {favorites.map((fav) => {
                    const tour = fav.tour;
                    if (!tour) return null;
                    return (
                      <Card
                        key={fav.favouriteId}
                        onClick={() => {
                          navigate(`/tours/${tour.tourId}/${tour.slug}`);
                        }}
                        className="group relative p-4 flex gap-4 items-center border border-border 
                       rounded-xl transition-all duration-300 cursor-pointer 
                       hover:border-pink-400 hover:shadow-lg hover:bg-pink-50/30"
                      >
                        {/* Hình ảnh tour */}
                        <div className="overflow-hidden rounded-lg">
                          <img
                            src={tour.image || "/placeholder.svg"}
                            alt={tour.title}
                            className="w-32 h-28 object-cover rounded-lg transform transition-transform 
                           duration-300 group-hover:scale-110"
                          />
                        </div>

                        {/* Thông tin tour */}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 group-hover:text-pink-600 transition-colors">
                            {tour.title}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {tour.destination || "Đang cập nhật"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tour.time || ""}
                          </p>
                        </div>

                        {/* Biểu tượng trái tim */}
                        <Heart
                          className="absolute top-3 right-3 w-4 h-4 text-pink-400 opacity-0 
                         group-hover:opacity-100 transition-opacity"
                        />
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
