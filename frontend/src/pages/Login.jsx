import { useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Mail, Lock, Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const data = await login(email, password);
      const loggedInUser = data?.user ?? data?.data;

      console.log("XP-DBUT: ", loggedInUser)

      if (loggedInUser) {
        if(loggedInUser.role === "admin") {
          navigate("/admin");
        } else if (loggedInUser.role === "supplier"){
          navigate("/supplier/dashboard");
        } else {
          navigate("/tours");
        }
        return;
      }
      // Fallback
      navigate("/auth/login");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.status === 401) {
        setErr("Sai email hoặc mật khẩu.");
      } else if (error.code === "ERR_NETWORK") {
        setErr(
          "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng."
        );
      } else {
        setErr("Đăng nhập thất bại. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    // SỬ DỤNG bg-gray-50 ĐỂ TẠO NỀN TRẮNG XÁM TÁCH BIỆT VỚI HEADER/FOOTER XANH
    // pt-20 để tránh bị Header che khuất nếu Header fixed
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20 relative">   

      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500 mt-10">
        
        {/* Cột trái: Hình ảnh & Welcome Message */}
        <div className="hidden md:block w-1/2 relative bg-slate-100">
          <img
            src="/images/login-img.png"
            alt="Login visual"
            className="object-cover w-full h-full absolute inset-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop"; 
            }}
          />
          {/* Lớp phủ gradient Xanh để đồng bộ thương hiệu */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent flex flex-col justify-end p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Welcome Back!</h3>
            <p className="text-blue-50 text-base leading-relaxed opacity-90">
              Sign in to verify your identity and start planning your next great adventure.
            </p>
          </div>
        </div>

        {/* Cột phải: Form đăng nhập */}
        <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center">
          <div className="mb-8">
             <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
               <Lock className="w-6 h-6" />
             </div>
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Login</h2>
             <p className="text-slate-500">Welcome back! Please enter your details.</p>
          </div>

          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="mt-0.5 font-bold">⚠️</div>
              <div>{err}</div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type="email"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type="password"
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-right">
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-cyan-600 font-semibold hover:underline transition-colors">
                    Forgot password?
                  </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              // Nút sử dụng Gradient xanh để đồng bộ với Header
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don’t have an account?{" "}
              <Link to="/signup" className="font-bold text-blue-600 hover:text-cyan-600 hover:underline transition-colors">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}