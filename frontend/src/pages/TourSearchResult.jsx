import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import TourCard from "../components/TourCard";
import TourSearchBar from "../components/TourSearchBar";
import { filterToursBySlug } from "../api/tours";
import { toSlug } from "../utils/slug";

export default function TourSearchResult({ user, setUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy slug từ URL (nếu có, ví dụ user reload hoặc điều hướng từ Dashboard)
  const initialSlug = searchParams.get("slug") || "";

  const [destination, setDestination] = useState(initialSlug.replace(/-/g, " "));
  const [departure, setDeparture] = useState("Hồ Chí Minh");
  const [date, setDate] = useState(null);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSlug.replace(/-/g, " "));

  const handleLogout = () => setUser(null);

  // ✅ Tự động fetch tour khi trang mở có sẵn slug (từ Dashboard)
  useEffect(() => {
    const slugFromUrl = searchParams.get("slug");
    if (!slugFromUrl) return;

    const fetchTours = async () => {
      setLoading(true);
      setResults([]);
      setSearchTerm(slugFromUrl.replace(/-/g, " "));

      try {
        const { items } = await filterToursBySlug({
          slug: slugFromUrl,
          page: 1,
          limit: 10,
          status: "active",
        });
        setResults(items || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải tour:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, [searchParams]);

  // 🔍 Chỉ tìm khi bấm nút “Tìm”
  const handleSearch = async () => {
    const slug = toSlug(destination);
    if (!slug) return;

    // Cập nhật URL để người dùng có thể reload lại
    navigate(`/tour-search?slug=${encodeURIComponent(slug)}&page=1&limit=10`);

    setLoading(true);
    setResults([]);
    setSearchTerm(destination);

    try {
      const { items } = await filterToursBySlug({
        slug,
        page: 1,
        limit: 10,
        status: "active",
      });
      setResults(items || []);
    } catch (err) {
      console.error("❌ Lỗi khi tải tour:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const baseDate = date || new Date();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Nền trang */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, #0d47a1 40%, #f9fafb 40%)`,
        }}
      >
        <img
          src="/backgrounds/login-bg.png"
          alt="plane"
          className="w-full h-full object-cover"
        />
      </div>

      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Thanh tìm kiếm */}
          <div className="max-w-[640px] mx-auto w-full">
            <TourSearchBar
              destination={destination}
              setDestination={setDestination}
              departure={departure}
              setDeparture={setDeparture}
              date={date}
              setDate={setDate}
              onSearch={handleSearch}
              variant="compact"
            />
          </div>

          {/* Kết quả */}
          <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">
              {searchTerm
                ? `Kết quả tìm kiếm cho "${searchTerm}"`
                : "Hãy nhập điểm đến để tìm tour"}
            </h2>

            {searchTerm && (
              <p className="text-gray-500 mb-6">
                Tổng cộng: <strong>{results.length}</strong> tour
              </p>
            )}

            {loading ? (
              <p className="text-gray-400">Đang tải...</p>
            ) : results.length === 0 && searchTerm ? (
              <div className="text-gray-500 text-center py-6 bg-gray-50 rounded">
                Không tìm thấy tour phù hợp 😥
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((tour) => (
                  <TourCard
                    key={tour.tourId}
                    tour={tour}
                    baseDate={baseDate}
                    onView={() =>
                      navigate(`/du-lich/${tour.slug}/${tour.tourId}`)
                    }
                  />
                ))}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
