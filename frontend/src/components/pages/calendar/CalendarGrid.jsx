import { useState } from "react"
import { ChevronDown, ChevronLeft, ChevronRight, Clock } from "lucide-react"
import { Calendar } from "lucide-react"

const tours = [
  { id: "1", title: "Romantic Getaway", startDate: 2, endDate: 7, month: 7, year: 2028, color: "bg-blue-100" },
  { id: "2", title: "Cultural Exploration", startDate: 5, endDate: 9, month: 7, year: 2028, color: "bg-blue-50" },
  { id: "3", title: "Adventure Tour", startDate: 8, endDate: 9, month: 7, year: 2028, color: "bg-blue-100" },
  {
    id: "4",
    title: "City Highlights",
    startDate: 11,
    endDate: 14,
    month: 7,
    year: 2028,
    color: "bg-blue-400 text-blue-800",
  },
  { id: "5", title: "Venice Dreams", startDate: 15, endDate: 20, month: 7, year: 2028, color: "bg-blue-50" },
  { id: "6", title: "Safari Adventure", startDate: 16, endDate: 19, month: 7, year: 2028, color: "bg-blue-50" },
  { id: "7", title: "Alpine Escape", startDate: 18, endDate: 21, month: 7, year: 2028, color: "bg-blue-50" },
  {
    id: "8",
    title: "Seoul Cultural Exploration",
    startDate: 21,
    endDate: 23,
    month: 7,
    year: 2028,
    color: "bg-blue-50",
  },
  { id: "9", title: "Parisian Romance", startDate: 24, endDate: 30, month: 7, year: 2028, color: "bg-blue-50" },
  {
    id: "10",
    title: "Tokyo Cultural Adventure",
    startDate: 26,
    endDate: 29,
    month: 7,
    year: 2028,
    color: "bg-blue-50",
  },
  { id: "11", title: "Romantic Getaway", startDate: 29, endDate: 31, month: 7, year: 2028, color: "bg-blue-50" },
  { id: "12", title: "Bali Beach Escape", startDate: 30, endDate: 3, month: 8, year: 2028, color: "bg-blue-50" },
]

const calendarDaysData = [
  // Hàng 1
  { day: 25, isCurrentMonth: false },
  { day: 26, isCurrentMonth: false },
  { day: 27, isCurrentMonth: false },
  { day: 28, isCurrentMonth: false },
  { day: 29, isCurrentMonth: false },
  { day: 30, isCurrentMonth: false },
  { day: 1, isCurrentMonth: true },
  // Hàng 2
  { day: 2, isCurrentMonth: true },
  { day: 3, isCurrentMonth: true },
  { day: 4, isCurrentMonth: true },
  { day: 5, isCurrentMonth: true },
  { day: 6, isCurrentMonth: true },
  { day: 7, isCurrentMonth: true },
  { day: 8, isCurrentMonth: true },
  // Hàng 3
  { day: 9, isCurrentMonth: true },
  { day: 10, isCurrentMonth: true },
  { day: 11, isCurrentMonth: true },
  { day: 12, isCurrentMonth: true },
  { day: 13, isCurrentMonth: true },
  { day: 14, isCurrentMonth: true },
  { day: 15, isCurrentMonth: true },
  // Hàng 4
  { day: 16, isCurrentMonth: true },
  { day: 17, isCurrentMonth: true },
  { day: 18, isCurrentMonth: true },
  { day: 19, isCurrentMonth: true },
  { day: 20, isCurrentMonth: true },
  { day: 21, isCurrentMonth: true },
  { day: 22, isCurrentMonth: true },
  // Hàng 5
  { day: 23, isCurrentMonth: true },
  { day: 24, isCurrentMonth: true },
  { day: 25, isCurrentMonth: true },
  { day: 26, isCurrentMonth: true },
  { day: 27, isCurrentMonth: true },
  { day: 28, isCurrentMonth: true },
  { day: 29, isCurrentMonth: true },
  // Hàng 6
  { day: 30, isCurrentMonth: true },
  { day: 31, isCurrentMonth: true },
  { day: 1, isCurrentMonth: false },
  { day: 2, isCurrentMonth: false },
  { day: 3, isCurrentMonth: false },
  { day: 4, isCurrentMonth: false },
  { day: 5, isCurrentMonth: false },
]

const getToursStartingOnDay = (day, month) => {
  return tours.filter((t) => t.startDate === day && t.month === month)
}

// Lấy các tour ĐANG DIỄN RA vào ngày này (dùng cho Lịch Ngày/Tuần)
const getToursOngoingOnDay = (date) => {
  const day = date.getDate()
  const month = date.getMonth() + 1 // JS tháng từ 0-11, data của chúng ta từ 1-12
  const year = date.getFullYear()

  return tours.filter((t) => {
    // Xử lý trường hợp tour qua 2 tháng (ví dụ: Bali)
    if (t.id === "12") {
      const startOfTour = (t.month === month && t.startDate <= day)
      const endOfTour = (t.month + 1 === month && t.endDate >= day)
      return (startOfTour || endOfTour) && t.year === year
    }
    // Tour trong cùng 1 tháng
    return t.month === month && t.year === year && t.startDate <= day && t.endDate >= day
  })
}

// Lấy 7 ngày (Date object) cho Lịch Tuần
const getWeekDays = (date) => {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay()) // Bắt đầu từ Chủ Nhật
  const week = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    week.push(day)
  }
  return week
}

// Định dạng tiêu đề (Header) cho các chế độ xem
const formatDateHeader = (date, view) => {
  const options = { year: "numeric", month: "long", day: "numeric" }
  if (view === "Month") {
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }
  if (view === "Day") {
    return date.toLocaleDateString("en-US", options)
  }
  if (view === "Week") {
    const week = getWeekDays(date)
    const start = week[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })
    const end = week[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })
    return `${start} - ${end}, ${date.getFullYear()}`
  }
}

// Định dạng ngày tháng cho thẻ tour (ví dụ: "Jul 2 - Jul 7")
const formatTourDate = (tour) => {
  const monthStr = "Jul" // Giả sử chỉ làm cho tháng 7
  if (tour.id === "12") return "Jul 30 - Aug 3"
  return `${monthStr} ${tour.startDate} - ${monthStr} ${tour.endDate}`
}

export default function CalendarGrid({ selectedTour, setSelectedTour, currentDate, setCurrentDate, calendarView, setCalendarView }) {
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  // Hàm điều hướng (Trước/Sau)
  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (calendarView === "Month") {
      newDate.setMonth(newDate.getMonth() - 1)
    } else if (calendarView === "Week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setDate(newDate.getDate() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (calendarView === "Month") {
      newDate.setMonth(newDate.getMonth() + 1)
    } else if (calendarView === "Week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setDate(newDate.getDate() + 1)
    }
    setCurrentDate(newDate)
  }

  // Hàm render 1 thẻ tour (dùng chung cho cả 3 view)
  const renderTourButton = (tour) => {
    const isActive = selectedTour && selectedTour.id === tour.id
    return (
      <button
        key={tour.id}
        onClick={() => setSelectedTour(tour)}
        className={`w-full text-left p-2 rounded cursor-pointer hover:opacity-80 transition ${
          isActive ? "bg-blue-500 text-white" : tour.color
        }`}
      >
        <p className="text-xs font-bold truncate mb-1">{tour.title}</p>
        <div className="flex items-center text-xs opacity-80">
          <Calendar className="w-3 h-3 mr-1" />
          {formatTourDate(tour)}
        </div>
      </button>
    )
  }

  return (
      <div className="flex-1 bg-white rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">

        {/* Cụm điều hướng (MỚI) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 border rounded-lg hover:bg-muted transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 border rounded-lg hover:bg-muted transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="font-semibold text-lg ml-2">
            {formatDateHeader(currentDate, calendarView)}
          </span>
        </div>

        {/* Cập nhật các nút Day, Week, Month */}
        <div className="flex gap-2">
          <button
            onClick={() => setCalendarView("Day")}
            className={`px-4 py-2 text-sm rounded transition ${
              calendarView === "Day"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "hover:bg-muted"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setCalendarView("Week")}
            className={`px-4 py-2 text-sm rounded transition ${
              calendarView === "Week"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "hover:bg-muted"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setCalendarView("Month")}
            className={`px-4 py-2 text-sm rounded transition ${
              calendarView === "Month"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "hover:bg-muted"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center text-sm font-semibold text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid (SỬA LẠI LOGIC) */}
      {/* Chỉ hiển thị lưới tháng khi view là "Month" */}
      {calendarView === "Month" && (
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {calendarDaysData.map((dayInfo, idx) => {
            const toursForDay = (dayInfo.isCurrentMonth && currentDate.getMonth() + 1 === 7)
              ? getToursStartingOnDay(dayInfo.day, 7)
              : []
            return (
              <div key={idx} className={`min-h-[120px] p-2 ${dayInfo.isCurrentMonth ? "bg-white" : "bg-gray-50"}`}>
                <p
                  className={`text-xs font-semibold mb-1 ${
                    dayInfo.isCurrentMonth ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {dayInfo.day}
                </p>
                <div className="space-y-1">
                  {toursForDay.map(renderTourButton)}
                </div>
              </div>
            )
          })}
        </div>
      )}

        {/* CHẾ ĐỘ XEM "WEEK" (MỚI) */}
      {calendarView === "Week" && (
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          {getWeekDays(currentDate).map((day, idx) => {
            const toursOnDay = getToursOngoingOnDay(day)
            return (
              <div key={idx} className="min-h-[300px] p-2 bg-white">
                <p className="text-xs font-semibold text-foreground mb-1 text-center">{day.getDate()}</p>
                <div className="space-y-1">
                  {toursOnDay.map(renderTourButton)}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* CHẾ ĐỘ XEM "DAY" (MỚI) */}
      {calendarView === "Day" && (
        <div className="min-h-[300px] border rounded-lg p-4 space-y-4">
          {getToursOngoingOnDay(currentDate).map(tour => (
            <div key={tour.id} className="flex items-center gap-4 p-2 border-b">
              <Clock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-grow">
                {renderTourButton(tour)}
              </div>
            </div>
          ))}
          {getToursOngoingOnDay(currentDate).length === 0 && (
            <p className="text-muted-foreground text-center pt-10">No tours scheduled for this day.</p>
          )}
        </div>
      )}
    </div>
  )
}
