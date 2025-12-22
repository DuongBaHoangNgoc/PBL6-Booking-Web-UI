import React, { useState, useEffect, useMemo } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  MapPin, 
  Clock, 
  TrendingUp, 
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  ArrowRight,
  Mail,
  Phone,
  LayoutGrid,
  Table as TableIcon,
  Layers
} from "lucide-react"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  subDays,
  addWeeks,
  subWeeks,
  addYears,
  subYears,
  eachDayOfInterval,
  isWithinInterval,
  startOfYear,
  endOfYear,
  eachMonthOfInterval
} from "date-fns"

/**
 * DỮ LIỆU VẬN HÀNH MẪU
 */
const operationalTours = [
  { 
    id: "1", 
    title: "Tour Đà Nẵng - Hội An 3N2Đ", 
    startDate: new Date(2025, 11, 20), 
    endDate: new Date(2025, 11, 22),
    status: "confirmed", 
    booked: 28,
    totalSlots: 30,
    revenue: 45000000,
    guide: "Nguyễn Văn A",
    destination: "Đà Nẵng",
    color: "bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500",
    badgeColor: "bg-emerald-500",
    customers: [
      { name: "Hoàng Ngọc", phone: "0935xxx366", people: 2, paid: true },
      { name: "Thanh An", phone: "0388xxx075", people: 4, paid: true }
    ]
  },
  { 
    id: "2", 
    title: "Khám phá Vịnh Hạ Long", 
    startDate: new Date(2025, 11, 22), 
    endDate: new Date(2025, 11, 24),
    status: "pending", 
    booked: 8,
    totalSlots: 20,
    revenue: 12000000,
    guide: "Chưa phân công",
    destination: "Quảng Ninh",
    color: "bg-amber-100 text-amber-800 border-l-4 border-amber-500",
    badgeColor: "bg-amber-500",
    customers: [
      { name: "Lê Văn Tám", phone: "0901xxx123", people: 2, paid: false }
    ]
  },
  { 
    id: "4", 
    title: "Sapa Mờ Sương", 
    startDate: new Date(2025, 11, 25), 
    endDate: new Date(2025, 11, 27),
    status: "confirmed", 
    booked: 15,
    totalSlots: 15,
    revenue: 32000000,
    guide: "Trần Thị B",
    destination: "Lào Cai",
    color: "bg-blue-100 text-blue-800 border-l-4 border-blue-500",
    badgeColor: "bg-blue-500",
    customers: []
  }
]

/**
 * COMPONENT CHI TIẾT (Bên phải)
 */
const ScheduleDetails = ({ tour }) => {
  if (!tour) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed">
      <CalendarIcon className="w-12 h-12 text-gray-300 mb-4" />
      <p className="text-gray-500 font-medium text-sm">Chọn một tour để xem điều hành</p>
    </div>
  )

  const occupancy = Math.round((tour.booked / tour.totalSlots) * 100)

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="p-5 border-b">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">{tour.title}</h2>
          <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white ${tour.badgeColor}`}>
            {tour.status === 'confirmed' ? 'Đã chốt' : 'Đang chờ'}
          </div>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-3">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {tour.destination}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(tour.startDate, "dd/MM")} - {format(tour.endDate, "dd/MM")}</span>
        </div>
      </div>

      <div className="p-5 space-y-6 overflow-y-auto flex-1">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Lấp đầy</p>
            <p className="text-xl font-black text-blue-600">{occupancy}%</p>
            <div className="w-full bg-gray-200 h-1 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${occupancy}%` }} />
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Doanh thu</p>
            <p className="text-lg font-bold text-emerald-600 leading-none mt-1">{tour.revenue.toLocaleString()}đ</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nhân sự</h3>
          <div className="flex items-center gap-3 p-3 border rounded-xl bg-blue-50/30">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {tour.guide.split(' ').pop().charAt(0)}
            </div>
            <div>
              <p className="text-[10px] text-gray-500">Hướng dẫn viên</p>
              <p className="text-sm font-bold text-gray-800">{tour.guide}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Khách hàng tiêu biểu</h3>
          <div className="space-y-2">
            {tour.customers.length > 0 ? tour.customers.map((c, i) => (
              <div key={i} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{c.name}</span>
                  {c.paid ? (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">ĐÃ TRẢ</span>
                  ) : (
                    <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">CHƯA TRẢ</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <Phone className="w-3 h-3" /> {c.phone} • {c.people} người
                </div>
              </div>
            )) : <p className="text-xs italic text-gray-400 text-center py-4">Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-slate-50 flex gap-2">
        <button className="flex-1 bg-white border py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-50">In lệnh</button>
        <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700">Điều hành</button>
      </div>
    </div>
  )
}

/**
 * COMPONENT CHÍNH
 */
export default function CalendarPage() {
  const [selectedTour, setSelectedTour] = useState(operationalTours[0])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState("Month") // "Week" | "Month" | "Year"

  // Logic điều hướng dựa trên View
  const handleNext = () => {
    if (view === "Week") setCurrentDate(addWeeks(currentDate, 1))
    else if (view === "Month") setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addYears(currentDate, 1))
  }

  const handlePrev = () => {
    if (view === "Week") setCurrentDate(subWeeks(currentDate, 1))
    else if (view === "Month") setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(subYears(currentDate, 1))
  }

  const renderView = () => {
    switch (view) {
      case "Week": return <WeekView date={currentDate} tours={operationalTours} onSelect={setSelectedTour} selectedId={selectedTour?.id} />
      case "Month": return <MonthView date={currentDate} tours={operationalTours} onSelect={setSelectedTour} selectedId={selectedTour?.id} />
      case "Year": return <YearView date={currentDate} tours={operationalTours} onMonthSelect={(d) => { setCurrentDate(d); setView("Month"); }} />
      default: return null
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 text-slate-900 font-sans overflow-hidden">
      <header className="bg-white border-b px-8 py-5 shrink-0 shadow-sm z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-blue-900">Điều hành Lịch trình</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Supplier Operation Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              {["Week", "Month", "Year"].map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                    view === v ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v === "Week" ? "Tuần" : v === "Month" ? "Tháng" : "Năm"}
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button onClick={handlePrev} className="p-2 hover:bg-slate-100 rounded-xl border transition-colors"><ChevronLeft className="w-5 h-5" /></button>
              <div className="min-w-[140px] text-center font-black text-blue-900">
                {view === "Year" ? format(currentDate, "yyyy") : format(currentDate, "MMMM, yyyy")}
              </div>
              <button onClick={handleNext} className="p-2 hover:bg-slate-100 rounded-xl border transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-row gap-6 p-6 flex-1 overflow-hidden">
        {/* Lưới lịch động */}
        <section className="flex-[3] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
          {renderView()}
        </section>

        {/* Cánh phải chi tiết */}
        <aside className="flex-1 min-w-[340px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <ScheduleDetails tour={selectedTour} />
        </aside>
      </main>
    </div>
  )
}

/**
 * CHI TIẾT CÁC CHẾ ĐỘ XEM
 */

const WeekView = ({ date, tours, onSelect, selectedId }) => {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end: addDays(start, 6) })

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b bg-slate-50/50">
        {days.map(d => (
          <div key={d.toString()} className="py-4 text-center border-r last:border-0">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{format(d, "EEEE")}</p>
            <p className={`inline-flex w-8 h-8 items-center justify-center rounded-xl font-bold ${isSameDay(d, new Date()) ? "bg-blue-600 text-white shadow-lg" : "text-slate-700"}`}>
              {format(d, "d")}
            </p>
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 divide-x overflow-y-auto bg-slate-50/20">
        {days.map(d => {
          const dayTours = tours.filter(t => isWithinInterval(d, { start: t.startDate, end: t.endDate }))
          return (
            <div key={d.toString()} className="p-3 space-y-3 min-h-[400px]">
              {dayTours.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => onSelect(t)}
                  className={`p-3 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-105 ${t.color} ${selectedId === t.id ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
                >
                  <p className="text-[10px] font-black truncate mb-1">{t.title}</p>
                  <div className="flex items-center gap-1 text-[8px] font-bold opacity-80">
                    <Users className="w-2.5 h-2.5" /> {t.booked}/{t.totalSlots}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const MonthView = ({ date, tours, onSelect, selectedId }) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 1 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start, end })

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-7 border-b bg-slate-50/50">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(d => (
          <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 overflow-y-auto">
        {days.map((d, i) => {
          const dayTours = tours.filter(t => isWithinInterval(d, { start: t.startDate, end: t.endDate }))
          const isToday = isSameDay(d, new Date())
          const isCurrentMonth = isSameMonth(d, date)

          return (
            <div key={i} className={`min-h-[120px] border-r border-b p-2 transition-colors ${!isCurrentMonth ? "bg-slate-50/50 opacity-30" : "hover:bg-slate-50/30"}`}>
              <span className={`text-[11px] font-black inline-flex w-6 h-6 items-center justify-center rounded-lg mb-1 ${isToday ? "bg-blue-600 text-white" : "text-slate-400"}`}>
                {format(d, "d")}
              </span>
              <div className="space-y-1">
                {dayTours.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onSelect(t)}
                    className={`text-[9px] font-bold p-1.5 rounded-lg border shadow-sm cursor-pointer truncate transition-transform hover:scale-[1.02] ${t.color} ${selectedId === t.id ? "ring-1 ring-blue-500" : ""}`}
                  >
                    {isSameDay(d, t.startDate) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1" />}
                    {t.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const YearView = ({ date, tours, onMonthSelect }) => {
  const months = eachMonthOfInterval({
    start: startOfYear(date),
    end: endOfYear(date)
  })

  return (
    <div className="grid grid-cols-3 md:grid-cols-4 h-full p-6 gap-6 overflow-y-auto bg-slate-50/20">
      {months.map((m, i) => {
        const monthTours = tours.filter(t => isSameMonth(t.startDate, m))
        return (
          <div 
            key={i} 
            onClick={() => onMonthSelect(m)}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
          >
            <h3 className="text-sm font-black text-slate-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest mb-3 border-b pb-2">
              {format(m, "MMMM")}
            </h3>
            <div className="space-y-2">
              {monthTours.length > 0 ? (
                <>
                  <p className="text-2xl font-black text-slate-800">{monthTours.length} <span className="text-xs font-medium text-slate-400">Tours</span></p>
                  <div className="flex -space-x-2">
                    {monthTours.slice(0, 3).map(t => (
                      <div key={t.id} className={`w-6 h-6 rounded-full border-2 border-white ${t.badgeColor}`} title={t.title} />
                    ))}
                    {monthTours.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold">+{monthTours.length - 3}</div>}
                  </div>
                </>
              ) : (
                <p className="text-[10px] text-slate-300 italic">Không có lịch trình</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}