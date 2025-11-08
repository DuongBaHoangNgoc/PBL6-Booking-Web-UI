"use client";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Trash2, Heart, Edit3 } from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { getFilteredBookings, deleteBooking } from "@/api/bookings";
import { useNavigate } from "react-router-dom";

export default function BookingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // 🆕 Chế độ sửa
  const [editMode, setEditMode] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState([]);

  // 🧭 Gọi API bookings
  useEffect(() => {
    if (!user) return;

    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getFilteredBookings({
          userId: user.userId,
          limit,
          page,
        });

        const bookingsNormalized = data.map((b) => ({
          ...b,
          date: b.date || {
            startDate: null,
            endDate: null,
          },
        }));

        setBookings(bookingsNormalized);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách booking:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, page]);

  // ⚙️ Lọc theo trạng thái
  const filteredBookings =
    selectedStatus === "All"
      ? bookings
      : bookings.filter(
          (b) => b.bookingStatus === selectedStatus.toLowerCase()
        );

  // 🔄 Sắp xếp
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const priceA = Number(a.totalPrice) || 0;
    const priceB = Number(b.totalPrice) || 0;
    switch (sortBy) {
      case "Price: Low to High":
        return priceA - priceB;
      case "Price: High to Low":
        return priceB - priceA;
      case "Newest":
        return new Date(b.bookingDate) - new Date(a.bookingDate);
      default:
        return 0;
    }
  });

  // 💖 Thêm vào yêu thích
  const handleAddToFavorites = () => {
    if (selectedBookings.length === 0) return alert("Chưa chọn booking nào!");
    setFavorites((prev) => [...new Set([...prev, ...selectedBookings])]);
    alert("Đã thêm vào yêu thích!");
    setSelectedBookings([]);
    setEditMode(false);
  };

  // 🗑️ Xóa booking
  const handleDeleteBookings = async () => {
    if (selectedBookings.length === 0) return alert("Chưa chọn booking nào!");
    if (!window.confirm("Bạn có chắc muốn xóa những booking này không?"))
      return;

    try {
      // Gọi API xóa từng booking
      await Promise.all(selectedBookings.map((id) => deleteBooking(id)));

      alert(`🗑️ Đã xóa ${selectedBookings.length} booking thành công!`);

      // Cập nhật danh sách trên UI (lọc bỏ các booking đã xóa)
      setBookings((prev) =>
        prev.filter((b) => !selectedBookings.includes(b.bookingId))
      );

      // Reset chế độ chỉnh sửa
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
          {/* 🧭 Sidebar bộ lọc trạng thái */}
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

          {/* 🧾 Nội dung chính */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                My Bookings ({sortedBookings.length})
              </h2>

              {/* Bên phải: Sort + Sửa */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm font-medium bg-transparent border-none cursor-pointer"
                  >
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditMode(!editMode);
                    setSelectedBookings([]);
                  }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {editMode ? "Hoàn tất" : "Sửa"}
                </Button>
              </div>
            </div>

            {/* Hành động khi bật chế độ sửa */}
            {editMode && (
              <div className="flex gap-3 mb-6">
                <Button
                  variant="outline"
                  onClick={handleAddToFavorites}
                  disabled={selectedBookings.length === 0}
                >
                  <Heart className="w-4 h-4 mr-2" /> Thêm vào yêu thích
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

            {/* Danh sách bookings */}
            {sortedBookings.length > 0 ? (
              <div className="space-y-4">
                {sortedBookings.map((b) => {
                  const tour = b.tour || {};
                  const isSelected = selectedBookings.includes(b.bookingId);

                  return (
                    <Card
                      key={b.bookingId}
                      onClick={() => {
                        if (!editMode) {
                          navigate(`/bookings/${b.bookingId}`, {
                            state: { booking: b },
                          });
                        }
                      }}
                      className={`overflow-hidden border ${
                        selectedBookings.includes(b.bookingId)
                          ? "border-primary"
                          : "border-border"
                      } hover:shadow-md transition cursor-pointer`}
                    >
                      <div className="flex gap-4 p-4 items-center">
                        {editMode && (
                          <input
                            type="checkbox"
                            checked={selectedBookings.includes(b.bookingId)}
                            onClick={(e) => e.stopPropagation()} // 🧩 Ngăn click lan ra Card
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

                        <div className="relative w-48 h-40 flex-shrink-0 rounded-lg overflow-hidden group">
                          <img
                            src={b.tour?.image || "/placeholder.svg"}
                            alt={b.tour?.title || "Không có tiêu đề"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-lg font-bold">
                              {b.tour?.title || "Chưa có thông tin tour"}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {b.tour?.destination || "Đang cập nhật"}
                              </span>
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
          </div>
        </div>
      </div>
    </section>
  );
}
