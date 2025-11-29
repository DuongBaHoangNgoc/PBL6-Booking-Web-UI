import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/layout/Header"
import { getTourById } from "../api/tours"
import { FaMapMarkerAlt, FaClock, FaStar, FaRegCalendarAlt } from "react-icons/fa"
import ImageCarousel from "../components/ImageCarousel"
import HtmlBlock from "../components/HtmlBlock"
import TourScheduleAccordion from "../components/pages/tours/TourScheduleAccordion"
import CustomerReviews from "../components/CustomerReviews"

/* ================= Helpers ================= */

const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n || 0)).replace(/\s?₫/, " đ")

const toDateOnly = (v) => {
  if (!v) return null
  const d = v instanceof Date ? new Date(v) : new Date(String(v))
  if (isNaN(d)) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const fmtDate = (v) => {
  const d = toDateOnly(v)
  if (!d) return ""
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yy = d.getFullYear()
  return `${dd}/${mm}/${yy}`
}

const normalizeTour = (raw) => raw?.data?.data ?? raw?.data ?? raw ?? null

const collectImages = (tour) => {
  if (!tour) return []
  const main = tour.image ? [tour.image] : []
  const arr = Array.isArray(tour.images) ? tour.images : []
  const sameTour = arr.filter((i) => Number(i?.tourId ?? tour?.tourId) === Number(tour?.tourId))
  const extra = sameTour
    .map((i) => i.imageURL || i.imageUrl || i.url)
    .filter(Boolean)
    .map((u) => String(u).trim())
  return [...main, ...extra]
}

const collectDates = (tour) => tour?.startEndDates || tour?.start_end_dates || tour?.dates || []

function makeDateOptions(dates = []) {
  return dates
    .slice()
    .sort((a, b) => toDateOnly(a.startDate) - toDateOnly(b.startDate))
    .map((d) => ({
      id: String(d.dateId ?? d.id),
      label: `${fmtDate(d.startDate)} → ${fmtDate(d.endDate)}`,
      priceAdult: d.priceAdult ?? 0,
      priceChild: d.priceChildren ?? 0,
      availability: d.availability ?? 1,
    }))
}

function pickNearestFutureDateId(dates = []) {
  const today = toDateOnly(new Date())
  const future = dates
    .filter((d) => {
      const sd = toDateOnly(d.startDate)
      return sd && sd >= today
    })
    .sort((a, b) => toDateOnly(a.startDate) - toDateOnly(b.startDate))

  const id = future[0]?.dateId ?? future[0]?.id ?? null
  return id != null ? String(id) : null
}

const hasHtml = (s) => typeof s === "string" && /<\/?[a-z]/i.test(s)

const pickRichTimeline = (timelines) => {
  if (!Array.isArray(timelines) || !timelines.length) return null
  return (
    timelines.find((t) => hasHtml(t.description)) ||
    timelines.find((t) => typeof t.description === "string" && t.description.trim()) ||
    null
  )
}

/* ================= Component ================= */

export default function TourDetail({ user, setUser }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [tour, setTour] = useState(null)

  const [chosenDateId, setChosenDateId] = useState(null)
  const [adult, setAdult] = useState(2)
  const [child, setChild] = useState(0)
  const [infant, setInfant] = useState(0)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const raw = await getTourById(id)
        const entity = normalizeTour(raw)
        if (!mounted) return

        setTour(entity)
        setChosenDateId(pickNearestFutureDateId(collectDates(entity)))
      } catch (e) {
        console.error("getTourById error:", e?.message || e)
        if (mounted) setTour(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [id])

  const images = useMemo(() => collectImages(tour), [tour])
  const dateOptions = useMemo(() => makeDateOptions(collectDates(tour)), [tour])

  const chosen = useMemo(() => {
    const id = chosenDateId == null ? "" : String(chosenDateId)
    return dateOptions.find((x) => String(x.id) === id) || null
  }, [dateOptions, chosenDateId])

  const timelinesCompat = useMemo(() => {
    const arr = Array.isArray(tour?.timelines) ? tour.timelines : []
    return arr.map((t) => ({
      title: t.title ?? t.tl_title ?? "Lịch trình",
      description: t.description ?? t.tl_description ?? "",
    }))
  }, [tour])

  const richTimeline = useMemo(() => pickRichTimeline(timelinesCompat), [timelinesCompat])

  const total = useMemo(() => {
    if (!chosen) return 0
    return adult * (chosen.priceAdult || 0) + child * (chosen.priceChild || 0)
  }, [chosen, adult, child])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>
  }
  if (!tour) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Không tìm thấy tour</div>
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, #1a5f7a 40%, #f9fafb 40%)`,
        }}
      >
        <img src="/backgrounds/login-bg.png" alt="plane" className="w-full h-full object-cover" />
      </div>

      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a5f7a]">{tour.title}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <FaStar className="text-yellow-500" />
                {tour.reviews || "Chưa có đánh giá"}
              </span>
              <span className="inline-flex items-center gap-1">
                <FaClock />
                {tour.time || "—"}
              </span>
              <span className="inline-flex items-center gap-1">
                <FaMapMarkerAlt />
                {tour.destination || tour.address || "—"}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* LEFT */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <ImageCarousel images={images} interval={3500} height="h-96" />
                </div>

                {tour.description && (
                  <div className="mt-4 bg-white rounded-lg shadow p-4">
                    <h3 className="font-semibold mb-2">Tour Trọn Gói bao gồm</h3>
                    <hr className="my-4" />
                    <p className="text-gray-700 whitespace-pre-line">{tour.description}</p>
                  </div>
                )}

                {timelinesCompat.length > 1 ? (
                  <TourScheduleAccordion timelines={timelinesCompat} />
                ) : (
                  richTimeline && (
                    <div className="mt-4 bg-white rounded-lg shadow p-4">
                      <h3 className="font-semibold mb-2">{richTimeline.title}</h3>
                      {hasHtml(richTimeline.description) ? (
                        <HtmlBlock html={richTimeline.description} />
                      ) : (
                        <p className="text-gray-700 whitespace-pre-line">{richTimeline.description}</p>
                      )}
                    </div>
                  )
                )}

                <CustomerReviews
                  tourTitle={tour.title}
                  reviews={tour.reviewsComment || tour.reviews || tour.reviewList || []}
                />
              </div>

              {/* RIGHT */}
              <aside className="lg:col-span-1">
                <div className="bg-[#e8f5f3] rounded-lg border border-[#5dd9c1] p-4 sticky top-24">
                  <h3 className="font-semibold text-[#1a5f7a]">Lịch Trình và Giá Tour</h3>

                  <label className="block text-xs text-gray-500 mt-3 mb-1 uppercase">Chọn lịch khởi hành</label>
                  <select
                    value={chosenDateId ?? ""}
                    onChange={(e) => setChosenDateId(e.target.value)}
                    className="w-full border border-[#5dd9c1] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#5dd9c1]"
                  >
                    <option value="" disabled>
                      {dateOptions.length ? "Chọn ngày" : "Chưa có lịch"}
                    </option>
                    {dateOptions.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 space-y-2">
                    <RowQty
                      label="Người lớn"
                      note="> 9 tuổi"
                      value={adult}
                      onChange={setAdult}
                      price={chosen?.priceAdult}
                    />
                    <RowQty
                      label="Trẻ em"
                      note="5 - 9 tuổi"
                      value={child}
                      onChange={setChild}
                      price={chosen?.priceChild}
                    />
                    <RowQty label="Trẻ nhỏ" note="< 5 tuổi" value={infant} onChange={setInfant} price={0} />
                  </div>

                  <div className="mt-4 border-t border-[#5dd9c1] pt-3">
                    <div className="text-sm text-gray-600">Tổng Giá Tour</div>
                    <div className="text-2xl font-bold text-[#ff6b6b]">{fmtVND(total)}</div>
                  </div>

                  <button
                    className="mt-3 w-full bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-semibold py-2 rounded-lg transition-all active:scale-95"
                    disabled={!chosenDateId}
                    onClick={() => alert("Đặt giữ chỗ (demo)")}
                  >
                    Đặt giữ chỗ ngay
                  </button>
                  <button
                    className="mt-2 w-full border-2 border-[#5dd9c1] text-[#1a5f7a] font-semibold py-2 rounded-lg hover:bg-[#5dd9c1]/10 transition-all active:scale-95"
                    onClick={() => alert("Liên hệ tư vấn (demo)")}
                  >
                    Liên hệ tư vấn
                  </button>

                  {chosen && (
                    <div className="mt-4 text-sm text-gray-600 inline-flex items-center gap-2">
                      <FaRegCalendarAlt className="text-[#1a5f7a]" />
                      <span>Khởi hành: {chosen.label}</span>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

/* =============== Sub component =============== */

function RowQty({ label, note, value, onChange, price }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium text-[#1a5f7a]">{label}</div>
        <div className="text-xs text-gray-500">{note}</div>
      </div>
      <div className="flex items-center gap-2">
        {price != null && <span className="text-sm text-gray-600 mr-3">{fmtVND(price)}</span>}
        <button
          className="px-2 py-1 border border-[#5dd9c1] rounded hover:bg-[#5dd9c1]/10 transition-all active:scale-90"
          onClick={() => onChange(Math.max(0, value - 1))}
        >
          −
        </button>
        <span className="w-6 text-center font-medium">{value}</span>
        <button
          className="px-2 py-1 border border-[#5dd9c1] rounded hover:bg-[#5dd9c1]/10 transition-all active:scale-90"
          onClick={() => onChange(value + 1)}
        >
          +
        </button>
      </div>
    </div>
  )
}
