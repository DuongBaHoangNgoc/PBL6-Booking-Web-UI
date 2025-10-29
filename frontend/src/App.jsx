import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Home from "./pages/client/Home";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import TourDashboard from "./pages/admin/TourDashboard";
import { getProfile } from "./api/auth";
import TourSearchResult from "./pages/TourSearchResult";
import TourDetail from "./pages/TourDetail";
import { Profile } from "./pages/client/profile/Profile";
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
          path="/du-lich/:slug/:id"
          element={<TourDetail user={user} setUser={setUser} />}
        />
        <Route
          path="/profile"
          element={<Profile user={user} setUser={setUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
