"use client"

import { useMemo, useState } from "react"

function ratingLabel(x) {
  if (x >= 4.5) return "Tuyệt vời"
  if (x >= 4) return "Rất tốt"
  if (x >= 3.5) return "Tốt"
  if (x >= 2.5) return "Tạm được"
  return "Chưa tốt"
}

function fmtDate(d) {
  if (!d) return ""
  const date = new Date(d)
  if (isNaN(date)) return d
  const dd = String(date.getDate()).padStart(2, "0")
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const yy = date.getFullYear()
  return `${dd}-${mm}-${yy}`
}

export default function CustomerReviews({ reviews = [], tourTitle = "" }) {
  const [showCount, setShowCount] = useState(5)

  const clean = useMemo(() => {
    return (Array.isArray(reviews) ? reviews : []).map((r, idx) => ({
      id: r.reviewId,
      rating: Number(r.rating ?? 0),
      comment: r.comment,
      date: r.timestamp,
      name: r.user.userName || "Khách hàng",
    }))
  }, [reviews])

  const { avg, count } = useMemo(() => {
    const count = clean.length
    const sum = clean.reduce((s, it) => s + (isFinite(it.rating) ? it.rating : 0), 0)
    const avg = count ? Math.round((sum / count) * 10) / 10 : 0
    return { avg, count }
  }, [clean])

  const visible = clean.slice(0, showCount)

  return (
    <section id="review" className="mt-6">
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg md:text-xl font-semibold mb-3 text-[#1a5f7a]">
          Đánh giá khách hàng về {tourTitle || "Tour"}
        </h2>

        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-2xl font-bold text-[#1a5f7a]">{avg.toFixed(1)} /5</span>
          <span className="font-medium text-[#5dd9c1]">{ratingLabel(avg)}</span>
          <span className="text-gray-500">· {count} đánh giá</span>
        </div>

        <div className="mb-4">
          <ul className="flex gap-2 flex-wrap"></ul>
        </div>

        <div className="text-sm text-gray-600 mb-2">Đánh giá gần đây</div>

        <div className="divide-y">
          {visible.map((r) => (
            <article key={r.id} className="py-4 flex flex-col md:flex-row md:items-start gap-3">
              <div className="md:w-1/5">
                <div className="font-medium flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#5dd9c1]/20 text-[#1a5f7a]">
                    👤
                  </span>
                  <span>{r.name}</span>
                </div>
              </div>
              <div className="md:w-4/5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-[#1a5f7a] text-white text-sm">{r.rating.toFixed(1)}</span>
                  <span className="text-gray-700">{ratingLabel(r.rating)}</span>
                  <span className="text-gray-400 text-sm">{fmtDate(r.date)}</span>
                </div>
                <p className="text-gray-800">{r.comment || " "}</p>
              </div>
            </article>
          ))}
        </div>

        {showCount < clean.length && (
          <div className="text-center mt-3">
            <button
              className="px-5 py-2 rounded bg-[#5dd9c1]/20 hover:bg-[#5dd9c1]/30 text-[#1a5f7a] text-sm font-medium transition-all active:scale-95"
              onClick={() => setShowCount((c) => Math.min(c + 10, clean.length))}
            >
              Xem thêm {clean.length - showCount} nhận xét
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
