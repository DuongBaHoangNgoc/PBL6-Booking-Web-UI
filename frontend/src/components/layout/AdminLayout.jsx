import { Outlet, NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    Plane,
    Package,
    Calendar,
    BookText,
    DollarSign,
    User,
    LogOut,
    Sparkles,
    Globe,
} from "lucide-react";
import { useAuth } from "@/context/useAuth";
import { Button } from "../ui/button";
import PageHeader from "../pages/bookings/PageHeader";
import { PageFooter } from "../pages/bookings/PageFooter";
import { Toaster } from "@/components/ui/toaster"

// Đây là Sidebar đã được cập nhật theo giao diện sáng (light mode)
const AdminSidebar = () => {
    const { logout } = useAuth();

    // Hàm tạo className cho NavLink để xử lý trạng thái active
    const getNavLinkClass = ({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${isActive
            ? "bg-blue-600 text-white" // Style khi active
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900" // Style khi không active
        }`;

    return (
        <aside className="w-64 bg-white text-gray-700 flex flex-col min-h-screen p-4 border-r border-gray-200">
            {/* 1. Logo/Title */}
            <div className="flex items-center gap-2 px-3 mb-6">
                <Globe className="w-8 h-8 text-blue-600" />
                <h2 className="text-3xl font-bold text-blue-600">Bookings</h2>
            </div>

            {/* 2. Navigation Chính */}
            <nav className="flex flex-col space-y-1 flex-grow">
                <NavLink to="/admin/dashboard" className={getNavLinkClass}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/tours" className={getNavLinkClass}>
                    <Plane className="w-5 h-5" />
                    <span>Danh sách Tour</span>
                </NavLink>
                <NavLink to="/admin/tours" className={getNavLinkClass}>
                    <Plane className="w-5 h-5" />
                    <span>Quản lý Tour</span>
                </NavLink>
                <NavLink to="/admin/bookings" className={getNavLinkClass}>
                    <Plane className="w-5 h-5" />
                    <span>Quản lý Booking</span>
                </NavLink>
                <NavLink to="/admin/coupons" className={getNavLinkClass}>
                    <Calendar className="w-5 h-5" />
                    <span>Quản lý Khuyến mãi</span>
                </NavLink>
                <NavLink to="/admin/users" className={getNavLinkClass}>
                    <DollarSign className="w-5 h-5" />
                    <span>Quản lý Người dùng</span>
                </NavLink>
            </nav>

            {/* 3. Khối Upgrade (Phần dưới) */}
            <div className="bg-blue-50 rounded-lg p-4 text-center my-4">
                <Sparkles className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-800">
                    Enhance your experience!
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                    Upgrade your plan for more features.
                </p>
                <Button className="bg-blue-600 text-white hover:bg-blue-700 w-full">
                    Upgrade Now
                </Button>
            </div>

            {/* 4. Tài khoản & Đăng xuất */}
            <div className="space-y-1">
                <NavLink to="/admin/profile" className={getNavLinkClass}>
                    <User className="w-5 h-5" />
                    <span>Thông tin tài khoản</span>
                </NavLink>
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
};

// Layout chính của Supplier (Sidebar + Nội dung)
export const AdminLayout = () => {
    return (
        <div className="flex">
            <AdminSidebar />
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                <PageHeader />
                <Outlet />
                <Toaster />
                <PageFooter />
            </main>
        </div>
    );
};
