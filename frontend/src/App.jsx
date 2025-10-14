import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardLayout from "./pages/DashboardLayout";
import HotelDashboard from "./pages/HotelDashboard";
import TourDashboard from "./pages/TourDashboard";
import { getProfile } from "./services/auth";
import TourSearchResult from "./pages/TourSearchResult";
import TourDetail from "./pages/TourDetail";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 🔹 Khi reload trang, nếu có token thì gọi lại profile
    const token = localStorage.getItem("access_token");
    if (token) {
      getProfile(token)
        .then((res) => setUser(res.data))
        .catch(() => setUser(null));
    }
  }, []);

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

        {/* Signup */}
        <Route
          path="/signup"
          element={
            <>
              <Navbar user={user} setUser={setUser} />
              <div className="pt-20">
                <Signup />
              </div>
            </>
          }
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardLayout user={user} setUser={setUser} />}
        />

        {/* Hotel Dashboard */}
        <Route
          path="/hotel"
          element={<HotelDashboard user={user} setUser={setUser} />}
        />

        {/* Tour Dashboard */}
        <Route
          path="/tour"
          element={<TourDashboard user={user} setUser={setUser} />}
        />
        <Route
          path="/tour-search"
          element={<TourSearchResult user={user} setUser={setUser} />}
        />
        <Route
          path="/tours/:id"
          element={<TourDetail user={user} setUser={setUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
