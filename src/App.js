import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import HotelDashboard from "./pages/HotelDashboard"; // 👈 thêm file mới

function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("fake_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("fake_user", JSON.stringify(user));
    else localStorage.removeItem("fake_user");
  }, [user]);

  return (
    <Router>
      <Routes>
        {/* Trang Home */}
        <Route
          path="/"
          element={
            <>
              <Navbar user={user} setUser={setUser} />
              <div className="pt-20">
                <Home user={user} />
              </div>
            </>
          }
        />

        {/* Login */}
        <Route
          path="/login"
          element={
            <>
              <Navbar user={user} setUser={setUser} />
              <div className="pt-20">
                <Login setUser={setUser} />
              </div>
            </>
          }
        />

        {/* Dashboard (Flights) */}
        <Route
          path="/dashboard"
          element={<DashboardLayout user={user} setUser={setUser} />}
        />

        {/* Hotel Dashboard */}
        <Route
          path="/hotel"
          element={<HotelDashboard user={user} setUser={setUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
