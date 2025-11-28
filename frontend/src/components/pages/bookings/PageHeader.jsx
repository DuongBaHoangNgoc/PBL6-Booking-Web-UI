import { Search, Bell } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function PageHeader() {
  return (
    <div className="flex items-center justify-between bg-card p-6">
      <h1 className="text-3xl font-bold">Bookings</h1>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        {/* <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything"
            className="pl-10 pr-4 py-2 bg-muted rounded-lg border border-input focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div> */}

        {/* Notifications */}
        {/* <button className="relative p-2 rounded-lg hover:bg-muted transition">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button> */}

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition">
              <div className="text-right">
                <p className="text-sm font-medium">Ruben Herwitz</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
              <Avatar className="w-8 h-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ruben" alt="Ruben" />
                <AvatarFallback>RH</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
