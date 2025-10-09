import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, getProfile } from "../services/auth"; // 👈 gọi API backend

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
      // 🔹 Gọi API đăng nhập tới backend NestJS
      const res = await login(email, password);

      // Backend trả về: { access_token, refresh_token }
      const { access_token, refresh_token } = res.data;

      if (access_token) {
        localStorage.setItem("access_token", access_token);
      }
      if (refresh_token) {
        localStorage.setItem("refresh_token", refresh_token);
      }

      // 🔹 Gọi tiếp API /auth/Profile để lấy thông tin user
      const profileRes = await getProfile(access_token);
      setUser(profileRes.data);

      navigate("/dashboard"); // Chuyển đến trang dashboard sau khi login
    } catch (error) {
      console.error("Login error:", error);
      setErr("Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu.");
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
            {/* Email */}
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

            {/* Password */}
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
            <span className="text-green-500">Sign up</span>
          </p>

          <div className="flex justify-center mt-4 space-x-4">
            <button className="border px-4 py-2 rounded-lg w-32 flex items-center justify-center transition-colors duration-300 hover:bg-blue-600 hover:border-blue-600">
              <img src="/logos/fb.png" alt="Facebook" className="h-6" />
            </button>

            <button className="border px-4 py-2 rounded-lg w-32 flex items-center justify-center transition-colors duration-300 hover:bg-red-500 hover:border-red-500">
              <img src="/logos/google.png" alt="Google" className="h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
