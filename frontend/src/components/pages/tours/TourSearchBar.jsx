"use client"

import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { FaMapMarkerAlt, FaCalendarAlt, FaPaperPlane } from "react-icons/fa"

const DateInput = forwardRef(({ value, onClick }, ref) => (
  <span ref={ref} onClick={onClick} className="cursor-pointer font-semibold text-gray-800">
    {value || "Linh hoạt"}
  </span>
))

export default function TourSearchBar({
  destination,
  setDestination,
  departure,
  setDeparture,
  date,
  setDate,
  onSearch,
  variant = "default", // "default" | "compact"
}) {
  const isCompact = variant === "compact"

  const handleSearchClick = () => {
    if (!destination.trim()) {
      alert("Vui lòng nhập điểm đến")
      return
    }
    onSearch()
  }

  return (
    <section
      className={
        (isCompact ? "bg-white/90 border" : "bg-white shadow") + " rounded-lg " + (isCompact ? "p-3 mb-4" : "p-6 mb-6")
      }
    >
      <div className={isCompact ? "grid grid-cols-12 gap-2 items-center" : "grid grid-cols-5 gap-4"}>
        {/* Destination */}
        <div className={isCompact ? "col-span-4" : "col-span-5"}>
          <div className={"flex items-center border rounded-lg " + (isCompact ? "px-3 py-2" : "px-4 py-3")}>
            <FaMapMarkerAlt className={"text-gray-400 mr-2 " + (isCompact ? "text-sm" : "")} />
            <input
              type="text"
              placeholder="Bạn muốn đi đâu?"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={
                "w-full outline-none text-gray-700 placeholder-gray-400 font-medium " + (isCompact ? "text-sm" : "")
              }
            />
          </div>
        </div>

        {/* Date */}
        <div className={isCompact ? "col-span-3" : "col-span-2"}>
          <div className={"flex items-center border rounded-lg " + (isCompact ? "px-3 py-2" : "px-4 py-3")}>
            <FaCalendarAlt className={"text-gray-400 mr-2 " + (isCompact ? "text-sm" : "")} />
            <div className="flex flex-col">
              {!isCompact && <label className="text-xs text-gray-400 uppercase">Ngày khởi hành</label>}
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                dateFormat="dd/MM/yyyy"
                placeholderText="Linh hoạt"
                customInput={<DateInput value={date ? format(date, "dd/MM/yyyy") : ""} />}
              />
            </div>
          </div>
        </div>

        {/* Departure */}
        <div className={isCompact ? "col-span-3" : "col-span-2"}>
          <div className={"flex items-center border rounded-lg " + (isCompact ? "px-3 py-2" : "px-4 py-3")}>
            <FaPaperPlane className={"text-gray-400 mr-2 " + (isCompact ? "text-sm" : "")} />
            <div className="flex flex-col">
              {!isCompact && <label className="text-xs text-gray-400 uppercase">Khởi hành từ</label>}
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className={"font-semibold text-gray-800 bg-transparent outline-none " + (isCompact ? "text-sm" : "")}
              >
                <option>Hồ Chí Minh</option>
                <option>Hà Nội</option>
                <option>Đà Nẵng</option>
                <option>Cần Thơ</option>
                <option>Hải Phòng</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className={isCompact ? "col-span-2" : ""}>
          <button
            type="button"
            onClick={handleSearchClick}
            className={
              (isCompact ? "w-full px-4 py-2 text-sm" : "w-full md:w-auto px-8 py-3") +
              " bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-bold rounded-lg transition-all active:scale-95"
            }
          >
            Tìm
          </button>
        </div>
      </div>
    </section>
  )
}
