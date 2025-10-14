// src/components/ImageCarousel.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

/**
 * props:
 *  - images: string[] (URL ảnh)
 *  - interval: number ms (mặc định 3500)
 *  - height: tailwind height class (vd 'h-80' | 'h-[420px]')
 */
export default function ImageCarousel({
  images = [],
  interval = 3500,
  height = "h-[420px]",
}) {
  const list = useMemo(
    () => (Array.isArray(images) ? images.filter(Boolean) : []),
    [images]
  );
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const go = (n) => {
    if (!list.length) return;
    setIdx((p) => (p + n + list.length) % list.length);
  };

  const goTo = (n) => setIdx(n);

  // autoplay
  useEffect(() => {
    if (!list.length) return;
    if (paused) return;
    timerRef.current = setInterval(() => go(1), interval);
    return () => clearInterval(timerRef.current);
  }, [list.length, interval, paused]);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [list.length]);

  if (!list.length) {
    return (
      <div
        className={`w-full ${height} bg-gray-100 rounded-lg flex items-center justify-center`}
      >
        <span className="text-gray-500">Chưa có ảnh</span>
      </div>
    );
  }

  return (
    <div
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* khung chính */}
      <div className={`relative w-full ${height} overflow-hidden rounded-lg`}>
        {/* ảnh hiện tại */}
        <img
          key={idx}
          src={list[idx]}
          alt={`slide-${idx}`}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100"
          draggable={false}
        />

        {/* nút trái */}
        <button
          onClick={() => go(-1)}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          aria-label="Prev"
        >
          <FaChevronLeft />
        </button>
        {/* nút phải */}
        <button
          onClick={() => go(1)}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow"
          aria-label="Next"
        >
          <FaChevronRight />
        </button>

        {/* chấm nhỏ dưới ảnh (tuỳ thích) */}
        <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
          {list.map((_, i) => (
            <span
              key={i}
              onClick={() => goTo(i)}
              className={`w-2.5 h-2.5 rounded-full cursor-pointer ${
                i === idx ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* thumbnails */}
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
        {list.map((src, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden border ${
              i === idx ? "border-blue-600" : "border-transparent"
            }`}
            aria-label={`thumb-${i}`}
          >
            <img
              src={src}
              alt={`thumb-${i}`}
              className="w-full h-full object-cover"
              draggable={false}
            />
            {i === idx && (
              <span className="absolute inset-0 ring-2 ring-blue-600 rounded-md pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
