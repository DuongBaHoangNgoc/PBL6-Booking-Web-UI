import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  FaHome,
  FaWallet,
  FaBook,
  FaBriefcase,
  FaGlobe,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import SideBar from "../components/SideBar";

export default function DashboardLayout({ user, setUser }) {
  const [expanded, setExpanded] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [ticketClass, setTicketClass] = useState("Economy");
  const [departure, setDeparture] = useState(null);
  const [returnDate, setReturnDate] = useState(null);
  const [openTravelers, setOpenTravelers] = useState(false);

  const travelersRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (travelersRef.current && !travelersRef.current.contains(e.target)) {
        setOpenTravelers(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => setUser(null);
  const totalPersons = adults + children + infants;

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
        {/* Sidebar */}
        <SideBar
          expanded={expanded}
          setExpanded={setExpanded}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Tabs */}
          <div className="flex gap-6 mb-6">
            <button className="px-4 py-2 rounded-t-lg font-medium bg-white shadow text-blue-600">
              Flights
            </button>
            <button
              onClick={() => navigate("/hotel")}
              className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:text-blue-600"
            >
              Hotels
            </button>
            <button
              onClick={() => navigate("/tour")}
              className="px-4 py-2 rounded-t-lg font-medium text-gray-500 hover:text-blue-600"
            >
              Tours
            </button>
          </div>

          {/* Flight Search */}
          <section className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-stretch">
              {/* From */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">From</label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter departure city"
                  className="font-semibold text-gray-800 outline-none"
                />
              </div>
              {/* To */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">To</label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination city"
                  className="font-semibold text-gray-800 outline-none"
                />
              </div>
              {/* Travelers */}
              <div
                ref={travelersRef}
                className="relative border rounded-lg p-3 flex flex-col cursor-pointer"
                onClick={() => setOpenTravelers(!openTravelers)}
              >
                <label className="text-xs uppercase text-gray-400">
                  Travelers
                </label>
                <span className="font-semibold text-gray-800">
                  {totalPersons} Persons
                </span>
                <span className="text-xs text-gray-500">{ticketClass}</span>
                {openTravelers && (
                  <div className="absolute top-full mt-2 left-0 w-80 bg-white shadow-lg rounded-lg p-4 z-10">
                    <h4 className="font-semibold mb-2">Class</h4>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {[
                        "Economy",
                        "Premium Economy",
                        "Business",
                        "First Class",
                      ].map((c) => (
                        <label
                          key={c}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="radio"
                            name="class"
                            checked={ticketClass === c}
                            onChange={() => setTicketClass(c)}
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                    <h4 className="font-semibold mb-2">Travelers</h4>
                    {[
                      {
                        label: "Adults",
                        desc: "12 years and older",
                        value: adults,
                        set: setAdults,
                      },
                      {
                        label: "Children",
                        desc: "2 - 11 years",
                        value: children,
                        set: setChildren,
                      },
                      {
                        label: "Infants",
                        desc: "Under 2 years",
                        value: infants,
                        set: setInfants,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              item.set(Math.max(0, item.value - 1));
                            }}
                            className="px-2 py-1 border rounded"
                          >
                            −
                          </button>
                          <span>{item.value}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              item.set(item.value + 1);
                            }}
                            className="px-2 py-1 border rounded"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Departure */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">
                  Departure
                </label>
                <DatePicker
                  selected={departure}
                  onChange={(date) => {
                    setDeparture(date);
                    if (returnDate && date > returnDate) setReturnDate(null);
                  }}
                  minDate={new Date()}
                  customInput={
                    <div className="cursor-pointer font-semibold text-gray-800">
                      {departure ? (
                        <>
                          <div>{format(departure, "dd MMM yy")}</div>
                          <div className="text-xs text-gray-500">
                            {format(departure, "EEEE")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </div>
                  }
                />
              </div>
              {/* Return */}
              <div className="border rounded-lg p-3 flex flex-col justify-center">
                <label className="text-xs uppercase text-gray-400">
                  Return
                </label>
                <DatePicker
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  minDate={departure || new Date()}
                  customInput={
                    <div className="cursor-pointer font-semibold text-gray-800">
                      {returnDate ? (
                        <>
                          <div>{format(returnDate, "dd MMM yy")}</div>
                          <div className="text-xs text-gray-500">
                            {format(returnDate, "EEEE")}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">Select date</span>
                      )}
                    </div>
                  }
                />
              </div>
              {/* Search */}
              <button className="bg-red-600 text-white font-bold rounded-lg flex items-center justify-center hover:bg-red-700">
                SEARCH FLIGHT
              </button>
            </div>
          </section>

          {/* Special Offer + Best Offer */}
          <section className="mb-8">
            <h3 className="text-lg font-semibold mb-2">Special Offer</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white shadow rounded-lg p-4">
                <p className="font-semibold">Up to $100 Discount</p>
                <p className="text-sm text-gray-500">Code: SAVE100</p>
              </div>
              <div className="bg-white shadow rounded-lg p-4">
                <p className="font-semibold">Up to $50 Discount</p>
                <p className="text-sm text-gray-500">Code: SAVE50</p>
              </div>
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
