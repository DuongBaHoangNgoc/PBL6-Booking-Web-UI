"use client"

import { forwardRef } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { MapPin, Calendar, Plane, Search } from "lucide-react" // Using Lucide Icons

// Custom Input for DatePicker for better styling
const DateInput = forwardRef(({ value, onClick }, ref) => (
  <button 
    ref={ref} 
    onClick={onClick} 
    className="w-full text-left font-semibold text-slate-700 bg-transparent outline-none truncate"
  >
    {value || <span className="text-slate-400 font-normal">Select date</span>}
  </button>
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
      alert("Please enter destination")
      return
    }
    onSearch()
  }

  return (
    <section
      className={
        (isCompact ? "bg-white border shadow-sm" : "bg-white shadow-2xl shadow-blue-900/5") + 
        " rounded-2xl transition-all duration-300 " + 
        (isCompact ? "p-2 mb-4" : "p-4 md:p-5 mb-6")
      }
    >
      <div className={isCompact ? "grid grid-cols-1 md:grid-cols-12 gap-3 items-center" : "grid grid-cols-1 md:grid-cols-12 gap-4"}>
        
        {/* Destination Input */}
        <div className={isCompact ? "col-span-12 md:col-span-4" : "col-span-12 md:col-span-4"}>
          <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-cyan-400 hover:border-cyan-300 ${isCompact ? "px-3 py-2" : "px-4 py-3 h-full"}`}>
            <MapPin className={`text-cyan-500 mr-3 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
            <div className="flex-1 min-w-0">
              {!isCompact && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Destination</label>}
              <input
                type="text"
                placeholder="Where do you want to go?"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className={`w-full bg-transparent outline-none text-slate-700 font-semibold placeholder:text-slate-400 placeholder:font-normal ${isCompact ? "text-sm" : "text-base"}`}
              />
            </div>
          </div>
        </div>

        {/* Date Picker */}
        <div className={isCompact ? "col-span-12 md:col-span-3" : "col-span-12 md:col-span-3"}>
          <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-cyan-400 hover:border-cyan-300 ${isCompact ? "px-3 py-2" : "px-4 py-3 h-full"}`}>
            <Calendar className={`text-cyan-500 mr-3 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
            <div className="flex-1 min-w-0">
              {!isCompact && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Departure</label>}
              <DatePicker
                selected={date}
                onChange={(d) => setDate(d)}
                dateFormat="dd/MM/yyyy"
                customInput={<DateInput />}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Departure Select */}
        <div className={isCompact ? "col-span-12 md:col-span-3" : "col-span-12 md:col-span-3"}>
          <div className={`flex items-center bg-slate-50 border border-slate-200 rounded-xl transition-all focus-within:ring-2 focus-within:ring-cyan-200 focus-within:border-cyan-400 hover:border-cyan-300 ${isCompact ? "px-3 py-2" : "px-4 py-3 h-full"}`}>
            <Plane className={`text-cyan-500 mr-3 ${isCompact ? "w-4 h-4" : "w-5 h-5"}`} />
            <div className="flex-1 min-w-0">
              {!isCompact && <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Depart from</label>}
              <select
                value={departure}
                onChange={(e) => setDeparture(e.target.value)}
                className={`w-full bg-transparent outline-none text-slate-700 font-semibold cursor-pointer appearance-none ${isCompact ? "text-sm" : "text-base"}`}
              >
                <option>Ho Chi Minh City</option>
                <option>Ha Noi</option>
                <option>Da Nang</option>
                <option>Can Tho</option>
                <option>Hai Phong</option>
              </select>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className={isCompact ? "col-span-12 md:col-span-2" : "col-span-12 md:col-span-2"}>
          <button
            type="button"
            onClick={handleSearchClick}
            className={
              `w-full flex items-center justify-center gap-2 font-bold text-white rounded-xl transition-all shadow-lg shadow-cyan-200/50 
              bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 hover:shadow-cyan-300/50 hover:-translate-y-0.5 active:scale-95
              ${isCompact ? "px-4 py-2 text-sm h-full" : "px-6 py-4 h-full text-lg"}`
            }
          >
            {isCompact ? <Search className="w-4 h-4" /> : <Search className="w-5 h-5" />}
            {isCompact ? "Search" : "Search"}
          </button>
        </div>
      </div>
    </section>
  )
}