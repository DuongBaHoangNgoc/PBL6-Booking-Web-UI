import PageHeader from "@/components/pages/bookings/PageHeader"
import { PageFooter } from "@/components/pages/bookings/PageFooter"
import { StatCardsGrid } from "@/components/pages/bookings/StatCard"
import { BookingsTable } from "@/components/pages/bookings/BookingsTable"
import { TripsChart } from "@/components/pages/bookings/TripsChart"

export default function ManageBookingsPage() {
  return (
    <div className=" bg-white rounded-lg">
      <StatCardsGrid />
      <BookingsTable />
    </div>
  )
}
