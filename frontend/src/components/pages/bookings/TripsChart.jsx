import React from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button" // <-- Đã sửa 'in' thành 'from'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

const chartData = [
  { date: "Aug 27", done: 1200, cancelled: 400 },
  { date: "Sep 27", done: 1300, cancelled: 350 },
  { date: "Oct 27", done: 1400, cancelled: 380 },
  { date: "Nov 27", done: 1600, cancelled: 450 },
  { date: "Dec 27", done: 1500, cancelled: 420 },
  { date: "Jan 28", done: 1780, cancelled: 600 },
  { date: "Feb 28", done: 1650, cancelled: 520 },
  { date: "Mar 28", done: 1700, cancelled: 480 },
  { date: "Apr 28", done: 1900, cancelled: 550 },
  { date: "May 28", done: 1850, cancelled: 520 },
  { date: "Jun 28", done: 1750, cancelled: 480 },
  { date: "Jul 28", done: 1700, cancelled: 450 },
]

export function TripsChart() {
  return (
    <Card className="m-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Trips Overview</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
              Last 12 Months
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Last 7 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 30 Days</DropdownMenuItem>
            <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
            <DropdownMenuItem>Last 12 Months</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <div className="mb-4 flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span className="text-sm text-muted-foreground">Done</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full border-2 border-dashed" />
            <span className="text-sm text-muted-foreground">Cancelled</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorDone" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d1d5db" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#d1d5db" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
              labelStyle={{ color: "#000" }}
            />
            <Area
              type="monotone"
              dataKey="done"
              stroke="#60a5fa"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDone)"
            />
            <Area
              type="monotone"
              dataKey="cancelled"
              stroke="#d1d5db"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCancelled)"
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}