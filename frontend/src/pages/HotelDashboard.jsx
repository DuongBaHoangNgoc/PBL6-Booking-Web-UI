import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import FeaturedDestinations from "../components/FeaturedDestinations";
import Navbar from "../components/Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

export default function HotelDashboard({ user, setUser }) {
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [openRooms, setOpenRooms] = useState(false);

  const roomsRef = useRef();
  const navigate = useNavigate();

  const destinations = [
    {
      name: "Hạ Long Bay",
      price: "From $199",
      image: "/images/destination1.jpg",
    },
    { name: "Phú Quốc", price: "From $249", image: "/images/destination2.jpg" },
    { name: "Đà Nẵng", price: "From $179", image: "/images/destination3.jpg" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (roomsRef.current && !roomsRef.current.contains(e.target)) {
        setOpenRooms(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => setUser(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
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

      {/* Navbar */}
      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-6 mb-6">
            <button
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:text-blue-600"
            >
              Flights
            </button>
            <button className="px-4 py-2 rounded-t-lg font-medium bg-white shadow text-blue-600">
              Hotels
            </button>
            <button
              onClick={() => navigate("/tour")}
              className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:text-blue-600"
            >
              Tours
            </button>
          </div>

          {/* Hotel Search */}
          <section className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
              {/* Destination */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">
                  Destination
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="City, Country"
                  className="font-semibold text-gray-800 outline-none"
                />
              </div>
              {/* Check In */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">
                  Check In
                </label>
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => {
                    setCheckIn(date);
                    if (checkOut && date > checkOut) setCheckOut(null);
                  }}
                  minDate={new Date()}
                  customInput={
                    <div className="cursor-pointer font-semibold text-gray-800">
                      {checkIn ? (
                        <>
                          <div>{format(checkIn, "dd MMM yy")}</div>
                          <div className="text-xs text-gray-500">
                            {format(checkIn, "EEEE")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </div>
                  }
                />
              </div>
              {/* Check Out */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">
                  Check Out
                </label>
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  minDate={checkIn || new Date()}
                  customInput={
                    <div className="cursor-pointer font-semibold text-gray-800">
                      {checkOut ? (
                        <>
                          <div>{format(checkOut, "dd MMM yy")}</div>
                          <div className="text-xs text-gray-500">
                            {format(checkOut, "EEEE")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </div>
                  }
                />
              </div>
              {/* Rooms & Guests */}
              <div
                ref={roomsRef}
                className="relative border rounded-lg p-3 flex flex-col cursor-pointer"
                onClick={() => setOpenRooms(!openRooms)}
              >
                <label className="text-xs uppercase text-gray-400">
                  Rooms & Guests
                </label>
                <p className="font-semibold">
                  {rooms} Room • {guests} Guests
                </p>
                {openRooms && (
                  <div className="absolute top-full mt-2 left-0 w-72 bg-white shadow-lg rounded-lg p-4 z-10">
                    <h4 className="font-semibold mb-2">Rooms & Guests</h4>
                    {/* Rooms */}
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-sm">Rooms</p>
                        <p className="text-xs text-gray-500">How many rooms?</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRooms(Math.max(1, rooms - 1));
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          −
                        </button>
                        <span>{rooms}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRooms(rooms + 1);
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Guests */}
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium text-sm">Guests</p>
                        <p className="text-xs text-gray-500">
                          How many guests?
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuests(Math.max(1, guests - 1));
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          −
                        </button>
                        <span>{guests}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setGuests(guests + 1);
                          }}
                          className="px-2 py-1 border rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Search */}
              <button className="bg-red-600 text-white font-bold rounded-lg flex items-center justify-center hover:bg-red-700">
                SEARCH HOTEL
              </button>
            </div>
          </section>

          {/* Trip package + Best Offer */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Trip Package</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <FeaturedDestinations destinations={destinations} />
            </div>
          </section>
          <section>
            <h3 className="text-lg font-semibold mb-2">Best Offer</h3>
            <div className="bg-white shadow rounded-lg divide-y">
              {[
                {
                  route: "Delhi → Toronto",
                  price: "$546",
                  date: "15 Aug - 22 Aug",
                },
                {
                  route: "Chennai → Mumbai",
                  price: "$345",
                  date: "15 Aug - 22 Aug",
                },
                {
                  route: "Mumbai → Bangalore",
                  price: "$198",
                  date: "15 Aug - 22 Aug",
                },
              ].map((offer, i) => (
                <div key={i} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium">{offer.route}</p>
                    <p className="text-sm text-gray-500">{offer.date}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="font-bold">{offer.price}</span>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
