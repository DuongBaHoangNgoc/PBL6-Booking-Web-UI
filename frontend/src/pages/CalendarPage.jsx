import PageHeader from "@/components/pages/bookings/PageHeader"
import CalendarGrid from "@/components/pages/calendar/CalendarGrid"
import ScheduleDetails from "@/components/pages/calendar/ScheduleDetails"
import { PageFooter } from "@/components/pages/bookings/PageFooter"
import { useState } from "react"

const tours = [
  { id: "1", title: "Romantic Getaway", startDate: 2, endDate: 7, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  { id: "2", title: "Cultural Exploration", startDate: 5, endDate: 9, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  { id: "3", title: "Adventure Tour", startDate: 8, endDate: 9, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  {
    id: "4",
    title: "City Highlights",
    startDate: 11,
    endDate: 16, // Sửa endDate để khớp ảnh (11-16)
    month: 7,
    year: 2028,
    color: "bg-blue-100 text-blue-800", // Màu mặc định
  },
  { id: "5", title: "Venice Dreams", startDate: 15, endDate: 20, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  { id: "6", title: "Safari Adventure", startDate: 16, endDate: 19, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  { id: "7", title: "Alpine Escape", startDate: 18, endDate: 21, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  {
    id: "8",
    title: "Seoul Cultural Exploration",
    startDate: 21,
    endDate: 23,
    month: 7,
    year: 2028,
    color: "bg-blue-100 text-blue-800",
  },
  { id: "9", title: "Parisian Romance", startDate: 24, endDate: 30, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  {
    id: "10",
    title: "Tokyo Cultural Adventure",
    startDate: 26,
    endDate: 29,
    month: 7,
    year: 2028,
    color: "bg-blue-100 text-blue-800",
  },
  { id: "11", title: "Romantic Getaway", startDate: 29, endDate: 31, month: 7, year: 2028, color: "bg-blue-100 text-blue-800" },
  { id: "12", title: "Bali Beach Escape", startDate: 30, endDate: 3, month: 8, year: 2028, color: "bg-blue-100 text-blue-800" },
]

export default function CalendarPage() {
  const [selectedTour, setSelectedTour] = useState(tours[3])
  const [calendarView, setCalendarView] = useState("Month")
  const [currentDate, setCurrentDate] = useState(new Date(2028, 6, 11))

  return (
    <>
        <div className="flex flex-row gap-6 px-6 min-h-screen">
        <CalendarGrid
          selectedTour={selectedTour}
          setSelectedTour={setSelectedTour}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          calendarView={calendarView}
          setCalendarView={setCalendarView}
        />
        <ScheduleDetails tour={selectedTour} />
        </div>
    </>
    

  )
}
