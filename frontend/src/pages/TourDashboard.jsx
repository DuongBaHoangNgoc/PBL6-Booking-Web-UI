// TourDashboard.jsx
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

import TourSearchBar from "../components/TourSearchBar";

export default function TourDashboard({ user, setUser }) {
  const [destination, setDestination] = useState("");
  const [departure, setDeparture] = useState("Hồ Chí Minh");
  const [date, setDate] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => setUser(null);

  const handleSearch = () => {
    if (!destination.trim()) return;

    const baseDate = date ?? new Date(); // 👈 logic yêu cầu
    const params = new URLSearchParams({
      keyword: destination.trim(),
      departure,
      baseDate: format(baseDate, "yyyy-MM-dd"), // 👈 gửi lên query
    }).toString();

    navigate(`/tour-search?${params}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `linear-gradient(to bottom, #0d47a1 40%, #f9fafb 40%)`,
        }}
      >
        <img
          src="/backgrounds/login-bg.png"
          alt="plane"
          className="w-full h-full object-cover"
        />
      </div>

      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        <main className="flex-1 p-8 overflow-y-auto">
          <TourSearchBar
            destination={destination}
            setDestination={setDestination}
            departure={departure}
            setDeparture={setDeparture}
            date={date}
            setDate={setDate}
            onSearch={handleSearch}
          />
        </main>
      </div>
    </div>
  );
}
