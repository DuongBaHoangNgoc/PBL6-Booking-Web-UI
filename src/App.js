import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";

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
        {/* Trang Home luôn truyền user */}
        <Route
          path="/"
          element={
            <>
              <Navbar user={user} setUser={setUser} />
              <div className="pt-20">
                <Home user={user} /> {/*truyền user */}
              </div>
            </>
          }
        />

        {/* Trang Login */}
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

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<DashboardLayout user={user} setUser={setUser} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
