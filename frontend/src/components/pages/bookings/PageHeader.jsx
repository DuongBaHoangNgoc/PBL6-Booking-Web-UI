import { useAuth } from "@/context/useAuth";
import { Link } from "react-router-dom";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PageHeader() {
  const { user, logout } = useAuth();

  // Lấy avatar từ backend hoặc URL đầy đủ
  const avatarSrc = user?.avatar
    ? user.avatar.startsWith("http")
      ? user.avatar
      : `${import.meta.env.VITE_API_URL}/${user.avatar}`
    : null;

  const roleName =
    user?.role === "supplier"
      ? "Supplier"
      : user?.role === "admin"
        ? "Admin"
        : "User";

  return (
    <div className="flex items-center justify-between bg-card px-6 pb-2 border-b">
      <h1 className="text-3xl font-bold"></h1>
      <div className="flex items-center gap-6">
        {/* User Avatar + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{roleName}</p>
              </div>

              <Avatar className="w-8 h-8">
                <AvatarImage src={avatarSrc} alt={user?.fullName} />
                <AvatarFallback>
                  {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>

          {/* Dropdown content */}
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link to="/supplier/profile">Profile</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <Link to="/supplier/payments">Payments</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
