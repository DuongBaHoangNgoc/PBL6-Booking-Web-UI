import { Link } from "react-router-dom";
import {
  FaHome,
  FaWallet,
  FaBook,
  FaBriefcase,
  FaGlobe,
  FaQuestionCircle,
  FaSignOutAlt,
} from "react-icons/fa";

export default function SideBar({ user, handleLogout, expanded, setExpanded }) {
  const row =
    "flex items-center gap-3 px-4 py-2 hover:bg-blue-700 rounded transition-colors " +
    (expanded ? "" : "justify-center");

  return (
    <aside
      className={[
        // 👇 sticky giữ sidebar luôn hiện khi cuộn
        "sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto",
        // style
        "bg-blue-600 text-white flex flex-col z-20 shrink-0",
        "transition-all duration-300",
        expanded ? "w-64" : "w-16",
      ].join(" ")}
    >
      {/* Nút thu gọn/mở rộng */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={
          "p-4 text-lg focus:outline-none " + (expanded ? "" : "text-center")
        }
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Menu */}
      <nav className="flex-1 space-y-2 mt-2">
        <Link to="/dashboard" className={row}>
          <FaHome /> {expanded && <span>Home</span>}
        </Link>
        <Link to="/wallet" className={row}>
          <FaWallet /> {expanded && <span>Wallet</span>}
        </Link>
        <Link to="/booking" className={row}>
          <FaBook /> {expanded && <span>Booking</span>}
        </Link>
        <Link to="/business" className={row}>
          <FaBriefcase /> {expanded && <span>Business</span>}
        </Link>
        <Link to="/explore" className={row}>
          <FaGlobe /> {expanded && <span>Explore</span>}
        </Link>
        <Link to="/support" className={row}>
          <FaQuestionCircle /> {expanded && <span>Support</span>}
        </Link>
      </nav>

      {/* Đăng xuất */}
      <button
        onClick={handleLogout}
        className={
          "m-4 bg-red-500 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-red-600 " +
          (expanded ? "" : "justify-center")
        }
      >
        <FaSignOutAlt /> {expanded && <span>Logout</span>}
      </button>
    </aside>
  );
}
