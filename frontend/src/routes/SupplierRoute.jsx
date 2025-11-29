import { useAuth } from "@/context/useAuth";
import { Navigate, Outlet } from "react-router-dom";

export const SupplierRoute = () => {
  const { user, loading } = useAuth(); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Đang tải...
      </div>
    );
  }

  if (user && (user.role === 'supplier' || user.role === 'admin')) {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
};