import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import TourCard from "../components/TourCard";
import TourSearchBar from "../components/TourSearchBar";
import { searchTours } from "../services/tours";
import { parse, isValid } from "date-fns";
import { slugify } from "../utils/slugify";

function parseDateParam(raw) {
  if (!raw) return null;
  const a = parse(raw, "yyyy-MM-dd", new Date());
  if (isValid(a)) return a;
  const b = parse(raw, "dd/MM/yyyy", new Date());
  return isValid(b) ? b : null;
}

export default function TourSearchResult({ user, setUser }) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const keyword = searchParams.get("keyword") || "";
  const departureQS = searchParams.get("departure") || "";
  const dateQS = searchParams.get("date") || "";

  const [destination, setDestination] = useState(keyword);
  const [departure, setDeparture] = useState(departureQS || "Hồ Chí Minh");
  const [date, setDate] = useState(() => parseDateParam(dateQS));

  useEffect(() => {
    setDestination(keyword);
    setDeparture(departureQS || "Hồ Chí Minh");
    setDate(parseDateParam(dateQS));
  }, [keyword, departureQS, dateQS]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => setUser(null);

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      try {
        const data = await searchTours(keyword);
        setResults(data || []);
      } catch (err) {
        console.error("Lỗi khi tải tour:", err);
      } finally {
        setLoading(false);
      }
    };
    if (keyword) fetchTours();
    else {
      setResults([]);
      setLoading(false);
    }
  }, [keyword]);

  const handleSearch = useMemo(
    () => () => {
      const params = new URLSearchParams({
        keyword: destination || "",
        departure: departure || "",
        date: date ? formatDateForQS(date) : "",
      }).toString();
      navigate(`/tour-search?${params}`);
    },
    [destination, departure, date, navigate]
  );

  function formatDateForQS(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  const baseDate = date || new Date();

  return (
    <div className="min-h-screen flex flex-col relative">
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

          <div className="max-w-6xl mx-auto bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-2 text-blue-600">
              Kết quả tìm kiếm cho "{keyword}" từ {departureQS}
            </h2>

            <p className="text-gray-500 mb-6">
              Ngày khởi hành: <strong>{dateQS || "Linh hoạt"}</strong> — Tổng
              cộng: <strong>{results.length}</strong> tour
            </p>

            {loading ? (
              <p className="text-gray-400">Đang tải...</p>
            ) : results.length === 0 ? (
              <div className="text-gray-500 text-center py-6 bg-gray-50 rounded">
                Không tìm thấy tour phù hợp 😥
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((tour) => (
                  <TourCard
                    key={tour.tourId}
                    tour={tour}
                    baseDate={baseDate}
                    onView={() =>
                      navigate(`/du-lich/${slugify(tour.title)}/${tour.tourId}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
