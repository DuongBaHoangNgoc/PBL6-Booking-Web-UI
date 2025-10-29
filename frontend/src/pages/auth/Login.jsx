import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getProfile } from "../../api/auth";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // 🔹 Gọi API login
      const res = await login(email, password);
      const { access_token, refresh_token } = res.data || {};

      if (!access_token) {
        throw new Error("Access token not found in response");
      }

      localStorage.setItem("access_token", access_token);
      if (refresh_token) localStorage.setItem("refresh_token", refresh_token);

      // 🔹 Lấy thông tin user từ Profile
      const profileRes = await getProfile(access_token);
      console.log("Profile:", profileRes.data);
      setUser(profileRes.data);

      navigate("/tour");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        setErr("Sai email hoặc mật khẩu.");
      } else if (error.code === "ERR_NETWORK") {
        setErr(
          "Không thể kết nối tới máy chủ. Kiểm tra backend có đang chạy không?"
        );
      } else {
        setErr("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/backgrounds/login-bg.png')" }}
    >
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Ảnh bên trái */}
        <div className="hidden md:block w-1/2">
          <img
            src="/images/login-img.png"
            alt="Login visual"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Form bên phải */}
        <div className="w-full md:w-1/2 p-8 bg-white/90">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Login</h2>
          <p className="text-gray-500 mb-6">Login to access your account</p>

          {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-between items-center">
              <a href="#" className="text-sm text-red-500 hover:underline">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-60"
            >
              {loading ? "Đang đăng nhập..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-green-500 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
