// components/TourScheduleAccordion.jsx
import { useMemo, useState } from "react";
import DOMPurify from "dompurify"; // npm i dompurify

function dayNumberFromTitle(title = "") {
  // Lấy số ngày từ tiêu đề "Ngày 1", "Ngày 2: ..."
  const m = String(title).match(/ngày\s*(\d+)/i);
  return m ? Number(m[1]) : 9999; // không có số -> cho xuống cuối
}

function firstImgFromHtml(html = "") {
  if (!html) return null;
  const div = document.createElement("div");
  div.innerHTML = html;
  const img = div.querySelector("img");
  return img?.getAttribute("src") || null;
}

export default function TourScheduleAccordion({ timelines = [] }) {
  // Sắp xếp theo số ngày
  const days = useMemo(() => {
    return [...(timelines || [])].sort(
      (a, b) => dayNumberFromTitle(a.title) - dayNumberFromTitle(b.title)
    );
  }, [timelines]);

  const [openAll, setOpenAll] = useState(false);
  const [openIds, setOpenIds] = useState(new Set());

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const onExpandAll = () => {
    setOpenAll(true);
    setOpenIds(new Set(days.map((d) => d.timelineId)));
  };
  const onCollapseAll = () => {
    setOpenAll(false);
    setOpenIds(new Set());
  };

  if (!days.length) return null;

  return (
    <div className="mt-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="font-semibold">Chương trình tour</h3>
        <div className="text-sm">
          {!openAll ? (
            <button
              className="text-blue-600 hover:underline"
              onClick={onExpandAll}
            >
              Xem tất cả
            </button>
          ) : (
            <button
              className="text-blue-600 hover:underline"
              onClick={onCollapseAll}
            >
              Thu gọn
            </button>
          )}
        </div>
      </div>

      <div className="divide-y">
        {days.map((d) => {
          const isOpen = openIds.has(d.timelineId);
          const safeHtml = DOMPurify.sanitize(d.description || ""); // an toàn XSS
          const thumb = firstImgFromHtml(d.description);

          return (
            <div key={d.timelineId} className="p-4">
              <button
                className="w-full flex items-center text-left"
                onClick={() => toggle(d.timelineId)}
              >
                {thumb ? (
                  <img
                    src={thumb}
                    alt={d.title}
                    className="w-16 h-10 object-cover rounded mr-3"
                  />
                ) : (
                  <div className="w-16 h-10 bg-gray-200 rounded mr-3" />
                )}
                <div className="flex-1">
                  <div className="font-medium">{d.title || "Ngày"}</div>
                  {/* nếu muốn mô tả ngắn dòng 1: cắt từ HTML */}
                </div>
                <span className="ml-3 text-gray-400">{isOpen ? "▾" : "▸"}</span>
              </button>

              {isOpen && (
                <div
                  className="mt-3 prose max-w-none prose-img:rounded"
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
