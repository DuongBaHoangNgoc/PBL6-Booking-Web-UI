import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/layout/Header"
import { getTourById } from "../api/tours"
import { FaMapMarkerAlt, FaClock, FaStar, FaRegCalendarAlt, FaCheckCircle, FaInfoCircle } from "react-icons/fa"
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-cyan-600">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          <span className="font-medium animate-pulse">Đang tải thông tin tour...</span>
        </div>
      </div>
    )
  }
  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy tour</h2>
          <button onClick={() => navigate("/tours")} className="text-cyan-600 hover:underline">Quay lại danh sách</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar user={user} setUser={setUser} />

      {/* ================= HERO SECTION (Theme Bright Ocean) ================= */}
      <div className="relative pt-28 pb-32 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-4xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-1">
                <FaMapMarkerAlt /> {tour.destination || tour.address || "Việt Nam"}
              </span>
              <span className="bg-yellow-400/90 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <FaStar /> {tour.reviews ? `${tour.reviews} đánh giá` : "Mới"}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md text-balance">
              {tour.title}
            </h1>

            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm md:text-base font-medium text-blue-50">
              <div className="flex items-center gap-2">
                <FaClock className="text-cyan-200" />
                <span>Thời gian: {tour.time || "Đang cập nhật"}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-cyan-200" />
                <span>Khởi hành: Hàng tuần</span>
              </div>
              {/* Add more info if available */}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT (Overlapping) ================= */}
      <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Gallery */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <ImageCarousel images={images} interval={4000} height="h-80 md:h-[500px]" />
            </div>

            {/* Description */}
            {tour.description && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <FaInfoCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Tổng quan Tour</h3>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                  {tour.description}
                </div>
              </div>
            )}

            {/* Timelines */}
            {timelinesCompat.length > 1 ? (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                 <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <FaRegCalendarAlt className="text-cyan-500" /> Lịch trình chi tiết
                 </h3>
                 <TourScheduleAccordion timelines={timelinesCompat} />
              </div>
            ) : (
              richTimeline && (
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">{richTimeline.title}</h3>
                  <div className="prose prose-slate max-w-none text-slate-600">
                    {hasHtml(richTimeline.description) ? (
                      <HtmlBlock html={richTimeline.description} />
                    ) : (
                      <p className="whitespace-pre-line">{richTimeline.description}</p>
                    )}
                  </div>
                </div>
              )
            )}

            {/* Reviews */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
               <CustomerReviews
                tourTitle={tour.title}
                reviews={tour.reviewsComment || tour.reviews || tour.reviewList || []}
              />
            </div>
          </div>

          {/* RIGHT COLUMN: Booking Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              
              {/* Pricing Card */}
              <div className="bg-white rounded-3xl shadow-xl shadow-cyan-900/5 border border-slate-100 p-6 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="bg-cyan-100 p-1.5 rounded text-cyan-600"><FaRegCalendarAlt size={16}/></span> 
                  Đặt Tour Ngay
                </h3>

                {/* Date Selection */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn ngày khởi hành</label>
                  <div className="relative">
                    <select
                      value={chosenDateId ?? ""}
                      onChange={(e) => setChosenDateId(e.target.value)}
                      className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-shadow cursor-pointer hover:border-cyan-300"
                    >
                      <option value="" disabled>
                        {dateOptions.length ? "-- Chọn ngày --" : "Đang cập nhật lịch"}
                      </option>
                      {dateOptions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <FaRegCalendarAlt />
                    </div>
                  </div>
                </div>

                {/* Quantity Selectors */}
                <div className="space-y-4 mb-6">
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
                  <RowQty 
                    label="Trẻ nhỏ" 
                    note="< 5 tuổi" 
                    value={infant} 
                    onChange={setInfant} 
                    price={0} 
                  />
                </div>

                {/* Total Price & Divider */}
                <div className="border-t border-slate-100 pt-4 mb-6">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-slate-500 mb-1">Tổng cộng</span>
                    <span className="text-3xl font-bold text-blue-600 tracking-tight">
                      {fmtVND(total)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!chosenDateId}
                    onClick={() => alert("Chức năng đang phát triển")}
                  >
                    Đặt Giữ Chỗ
                  </button>
                  <button
                    className="w-full bg-white border-2 border-cyan-100 text-cyan-600 font-bold py-3 rounded-xl hover:bg-cyan-50 hover:border-cyan-200 transition-all transform active:scale-[0.98]"
                    onClick={() => alert("Liên hệ tư vấn")}
                  >
                    Tư Vấn Miễn Phí
                  </button>
                </div>

                {/* Footer Info */}
                {chosen && (
                  <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-400 font-medium">
                      Ngày đã chọn: <span className="text-cyan-600">{chosen.label}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Need Help Card */}
              <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2">Cần hỗ trợ?</h4>
                <p className="text-sm text-blue-600 mb-4">Đội ngũ tư vấn của chúng tôi luôn sẵn sàng 24/7</p>
                <a href="tel:+84123456789" className="text-blue-700 font-bold text-lg hover:underline">
                  1900 1234
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

/* =============== Sub component UI Updated =============== */

function RowQty({ label, note, value, onChange, price }) {
  return (
    <div className="flex items-center justify-between group">
      <div>
        <div className="font-bold text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 group-hover:text-cyan-500 transition-colors">{note}</div>
      </div>
      <div className="flex items-center gap-3">
        {price != null && (
          <div className="text-right mr-2 hidden sm:block">
             <span className="text-xs text-slate-400 block">đơn giá</span>
             <span className="text-sm font-semibold text-slate-600">{fmtVND(price)}</span>
          </div>
        )}
        
        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-1">
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-500 border border-transparent hover:border-rose-100 transition-all disabled:opacity-30"
            onClick={() => onChange(Math.max(0, value - 1))}
            disabled={value <= 0}
          >
            -
          </button>
          <span className="w-8 text-center font-bold text-slate-700 text-sm">{value}</span>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white text-slate-500 hover:bg-cyan-50 hover:text-cyan-600 border border-transparent hover:border-cyan-100 transition-all"
            onClick={() => onChange(value + 1)}
          >
            +
          </button>
        </div>
      </div>
    </div>
  )
}