"use client"

import { useMemo } from "react"
import { FaStar, FaClock, FaRegCalendarAlt } from "react-icons/fa"

/* ===== Helpers ===== */
export const fmtVND = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(n || 0)).replace(/\s?₫/, " đ")

export const fmtDateDashed = (dateLike) => {
  const d = new Date(dateLike)
  if (isNaN(d)) return "—"
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}

const toDay = (v) => {
  const d = new Date(v)
  if (isNaN(d)) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

export const pickNearestStartAndPrice = (tour, baseDate) => {
  const dates = tour?.startEndDates || tour?.start_end_dates || tour?.dates || []
  if (!Array.isArray(dates) || !dates.length) return undefined

  const base = baseDate ? new Date(baseDate) : new Date()
  const byAsc = (a, b) => new Date(a.startDate) - new Date(b.startDate)
  const byDesc = (a, b) => new Date(b.startDate) - new Date(a.startDate)

  const upcoming = dates.filter((d) => new Date(d.startDate) >= base)
  const chosen = (upcoming.length ? [...upcoming].sort(byAsc)[0] : [...dates].sort(byDesc)[0]) || {}

  const priceAdult = Number(chosen?.priceAdult ?? chosen?.price_adult ?? chosen?.price)

  return {
    startDate: chosen?.startDate,
    priceAdult: Number.isFinite(priceAdult) ? priceAdult : undefined,
  }
}

/* ===== Component ===== */
export default function TourCard({ tour, onView, baseDate }) {
  const near = useMemo(() => pickNearestStartAndPrice(tour, baseDate), [tour, baseDate])

  return (
    <div className="flex items-center bg-white border rounded-lg p-4 shadow hover:shadow-md transition-all">
      <img
        src={tour.image || "/images/default-tour.jpg"}
        alt={tour.title}
        className="w-48 h-32 object-cover rounded-md mr-4"
      />

      <div className="flex-1">
        <h3 className="font-semibold text-lg text-[#1a5f7a]">{tour.title}</h3>

        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
          <span className="inline-flex items-center gap-1">
            <FaStar className="text-yellow-500" />
            {tour.reviews || "Chưa có đánh giá"}
          </span>
          <span className="inline-block h-4 w-px bg-gray-300" />
          <span className="inline-flex items-center gap-1">
            <FaClock />
            {tour.time || "—"}
          </span>
        </div>

        <div className="mt-1 text-sm text-gray-700 inline-flex items-center gap-2">
          <FaRegCalendarAlt className="text-[#1a5f7a]" />
          <span>{near?.startDate ? fmtDateDashed(near.startDate) : "Chưa có lịch khởi hành"}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 ml-4">
        <div className="text-right">
          <div className="text-lg font-bold text-[#ff6b6b]">
            {near?.priceAdult !== undefined ? fmtVND(near.priceAdult) : "—"}
          </div>
        </div>

        <button
          onClick={() => onView?.(tour)}
          className="bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] px-4 py-2 rounded font-semibold transition-all active:scale-95"
        >
          Xem Tour
        </button>
      </div>
    </div>
  )
}
