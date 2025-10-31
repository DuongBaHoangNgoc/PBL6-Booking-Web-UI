"use client"

import { useMemo, useState } from "react"
import DOMPurify from "dompurify"

function dayNumberFromTitle(title = "") {
  const m = String(title).match(/ngày\s*(\d+)/i)
  return m ? Number(m[1]) : 9999
}

function firstImgFromHtml(html = "") {
  if (!html) return null
  const div = document.createElement("div")
  div.innerHTML = html
  const img = div.querySelector("img")
  return img?.getAttribute("src") || null
}

export default function TourScheduleAccordion({ timelines = [] }) {
  const days = useMemo(() => {
    return [...(timelines || [])].sort((a, b) => dayNumberFromTitle(a.title) - dayNumberFromTitle(b.title))
  }, [timelines])

  const [openAll, setOpenAll] = useState(false)
  const [openIds, setOpenIds] = useState(new Set())

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const onExpandAll = () => {
    setOpenAll(true)
    setOpenIds(new Set(days.map((d) => d.timelineId)))
  }
  const onCollapseAll = () => {
    setOpenAll(false)
    setOpenIds(new Set())
  }

  if (!days.length) return null

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#5dd9c1]">
        <h3 className="font-semibold text-[#1a5f7a]">Chương trình tour</h3>
        <div className="text-sm">
          {!openAll ? (
            <button className="text-[#1a5f7a] hover:text-[#5dd9c1] font-medium transition-colors" onClick={onExpandAll}>
              Xem tất cả
            </button>
          ) : (
            <button
              className="text-[#1a5f7a] hover:text-[#5dd9c1] font-medium transition-colors"
              onClick={onCollapseAll}
            >
              Thu gọn
            </button>
          )}
        </div>
      </div>

      <div className="divide-y">
        {days.map((d) => {
          const isOpen = openIds.has(d.timelineId)
          const safeHtml = DOMPurify.sanitize(d.description || "")
          const thumb = firstImgFromHtml(d.description)

          return (
            <div key={d.timelineId} className="p-4">
              <button
                className="w-full flex items-center text-left hover:bg-[#5dd9c1]/5 p-2 rounded transition-colors"
                onClick={() => toggle(d.timelineId)}
              >
                {thumb ? (
                  <img
                    src={thumb || "/placeholder.svg"}
                    alt={d.title}
                    className="w-16 h-10 object-cover rounded mr-3"
                  />
                ) : (
                  <div className="w-16 h-10 bg-[#5dd9c1]/20 rounded mr-3" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-[#1a5f7a]">{d.title || "Ngày"}</div>
                </div>
                <span className="ml-3 text-[#5dd9c1]">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div
                  className="mt-3 prose max-w-none prose-img:rounded"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
