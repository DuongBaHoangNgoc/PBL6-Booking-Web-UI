import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Loader2, ArrowLeft, ShieldCheck, Key, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import api from "../api/axiosInstance";

export default function ForgotPassword() {
  // Quản lý bước (1: Nhập thông tin mới, 2: Xác thực OTP)
  const [step, setStep] = useState(1);
  
  // Form state
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [showPass, setShowPass] = useState(false);

  const navigate = useNavigate();

  // Xử lý Bước 1: Gửi yêu cầu và lưu mật khẩu tạm thời vào state
  const handleNextStep = async (e) => {
    e.preventDefault();
    setErr("");

    if (newPassword !== confirmPassword) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      // Gọi API gửi OTP: /auth/request-password-reset
      await api.post("/auth/request-password-reset", { email });
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.message || "Không thể gửi mã xác nhận. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý Bước 2: Xác nhận OTP và hoàn tất
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // Gọi API reset: /auth/reset-password
      await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      alert("Mật khẩu đã được thay đổi thành công!");
      navigate("/auth/login");
    } catch (error) {
      setErr(error.response?.data?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-20 relative">
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500 mt-10">
        
        {/* Cột trái: Hình ảnh & Welcome Message */}
        <div className="hidden md:block w-1/2 relative bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1000&auto=format&fit=crop"
            alt="Security"
            className="object-cover w-full h-full absolute inset-0"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent flex flex-col justify-end p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Reset Your Password</h3>
            <p className="text-blue-50 text-base leading-relaxed opacity-90">
              {step === 1 
                ? "Set up your new credentials and we'll help you verify them in the next step." 
                : "A 6-digit code has been sent to your email. Please enter it to finish."}
            </p>
          </div>
        </div>

        {/* Cột phải: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-14 bg-white flex flex-col justify-center">
          
          <button 
            onClick={() => step === 2 ? setStep(1) : navigate("/auth/login")}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 w-fit font-medium group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>

          <div className="mb-8">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              {step === 1 ? <Key className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              {step === 1 ? "Quên mật khẩu?" : "Xác thực OTP"}
            </h2>
            <p className="text-slate-500">
              {step === 1 
                ? "Nhập email và mật khẩu mới bạn muốn sử dụng." 
                : `Vui lòng kiểm tra mã xác thực gửi đến ${email}`}
            </p>
          </div>

          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
              <div className="mt-0.5 font-bold">⚠️</div>
              <div>{err}</div>
            </div>
          )}

          {step === 1 ? (
            /* BƯỚC 1: EMAIL + PASSWORD + CONFIRM */
            <form onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Email Address</label>
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
                <label className="block text-sm font-semibold text-slate-700">New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  </div>
                  <input
                    type={showPass ? "text" : "password"}
                    className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Confirm New Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all outline-none bg-white text-slate-900 placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tiếp tục"}
              </button>
            </form>
          ) : (
            /* BƯỚC 2: OTP */
            <form onSubmit={handleFinalSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700 text-center">Nhập mã xác thực (6 chữ số)</label>
                <div className="relative group max-w-[240px] mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    className="block w-full px-4 py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none bg-white text-slate-900 text-center text-3xl font-bold tracking-[0.3em] placeholder:text-slate-200"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                  />
                </div>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Không nhận được mã? <button type="button" onClick={handleNextStep} className="text-blue-600 font-bold hover:underline">Gửi lại</button>
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xác nhận & Đổi mật khẩu"}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Bạn đã nhớ mật khẩu?{" "}
              <Link to="/auth/login" className="font-bold text-blue-600 hover:text-cyan-600 hover:underline transition-colors">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}