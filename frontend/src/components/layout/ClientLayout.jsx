import { Outlet } from "react-router-dom";
import Navbar from "./Header";
import { Footer } from "./Footer";

// Layout chính cho client: đặt header fixed, dùng flex column để đảm bảo
// footer nằm ở dưới và main có padding-top để tránh header che phủ nội dung.
export const ClientLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/*
        flex-1 để chiếm không gian còn lại; pt-20 để bù cho header fixed
        (pt-20 = 5rem = ~80px). Nếu header thay đổi chiều cao, điều chỉnh giá trị này.
      */}
      <main className="flex-1 pt-16">
        <Outlet /> {/* Đây là nơi các trang con (Home, Profile) sẽ render */}
      </main>

      <Footer />
    </div>
  );
};
