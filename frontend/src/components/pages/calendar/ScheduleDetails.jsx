import { MoreVertical } from "lucide-react"

export default function ScheduleDetails({ tour }) {
  // Dùng mảng 5 placeholder
  const participantsAvatars = [
    "https://placehold.co/32x32/E0BBE4/000000?text=A",
    "https://placehold.co/32x32/957DAD/FFFFFF?text=B",
    "https://placehold.co/32x32/D291BC/FFFFFF?text=C",
    "https://placehold.co/32x32/FFC72C/000000?text=D",
    "https://placehold.co/32x32/9FE2BF/000000?text=E",
  ]

  return (
    <div className="w-80 bg-white border border-border rounded-lg p-6 flex-shrink-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Schedule Details</h2>
        <button className="p-1 hover:bg-muted rounded transition">
          <MoreVertical className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {tour ? (
        <>
          {/* City Highlights Section (Sửa layout) */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-blue-500 mb-4">{tour.title}</h3>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Destination</p>
                <p className="text-sm font-semibold text-foreground">New York, USA</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Duration</p>
                <p className="text-sm font-semibold text-foreground">6 Days / 5 Nights</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Date</p>
                <p className="text-sm font-semibold text-foreground">11 - 16 July 2028</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Total Participant</p>
                <p className="text-sm font-semibold text-foreground mb-2">25</p>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {participantsAvatars.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Participant ${i + 1}`}
                        width={32}
                        height={32}
                        className="rounded-full border-2 border-white w-8 h-8"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">& 20 others</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Points (Giữ nguyên, đã đúng) */}
          <div className="border-t border-border pt-6">
            <h4 className="font-bold text-foreground mb-4">Meeting Points</h4>

            <div className="space-y-6">
              {/* Airport */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">AIRPORT</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-sm font-semibold text-foreground">John F. Kennedy International Airport (JFK)</p>
                    <p className="text-xs text-muted-foreground">11 July 2028 - 08:00 AM</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Finish</p>
                    <p className="text-sm font-semibold text-foreground">John F. Kennedy International Airport (JFK)</p>
                    <p className="text-xs text-muted-foreground">16 July 2028 - 04:30 PM</p>
                  </div>
                </div>
              </div>

              {/* Station */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-3">STATION</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="text-sm font-semibold text-foreground">Grand Central Terminal</p>
                    <p className="text-xs text-muted-foreground">11 July 2028 - 09:00 AM</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Finish</p>
                    <p className="text-sm font-semibold text-foreground">Grand Central Terminal</p>
                    <p className="text-xs text-muted-foreground">16 July 2028 - 03:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Select a tour to see details.</p>
      )}
    </div>
  )
}
