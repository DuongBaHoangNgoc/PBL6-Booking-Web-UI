import { useState, useEffect } from "react";
import {
  ChevronLeft, Eye, EyeOff, User, Mail, Phone, Lock,
  Loader2, CreditCard, Building2, ShieldCheck, Plane
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- Cấu hình API ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// --- COMPONENT CON 1: STEP 1 - SIGNUP FORM (ĐÃ CẬP NHẬT) ---
function SignupForm({ role, onNext, loading }) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    userName: "",
    email: "",
    phoneNumber: "", // <--- 1. THÊM STATE Ở ĐÂY
    passWord: "",
    confirmPassword: "",
    avatar: null,
    agreeToTerms: false,
  });
  const [err, setErr] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Logic chỉ cho phép nhập số vào ô phoneNumber
    if (name === "phoneNumber" && !/^\d*$/.test(value)) return;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");

    // Validation cơ bản
    if (formData.passWord.length < 6) {
      setErr("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (formData.passWord !== formData.confirmPassword) {
      setErr("Mật khẩu xác nhận không khớp.");
      return;
    }
    // <--- 2. THÊM VALIDATION SỐ ĐIỆN THOẠI
    if (formData.phoneNumber.length < 10) {
      setErr("Số điện thoại không hợp lệ (ít nhất 10 số).");
      return;
    }
    if (!formData.agreeToTerms) {
      setErr("Vui lòng đồng ý với điều khoản dịch vụ.");
      return;
    }

    const apiForm = new FormData();
    apiForm.append("fullName", formData.fullName);
    apiForm.append("userName", formData.userName || formData.email.split('@')[0]);
    apiForm.append("email", formData.email);
    apiForm.append("phoneNumber", formData.phoneNumber); // <--- 3. GỬI LÊN SERVER
    apiForm.append("passWord", formData.passWord);
    apiForm.append("address", "");
    apiForm.append("birthDay", "2000-01-01");
    apiForm.append("role", role);

    onNext(apiForm, formData.email);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          Đăng ký {role === 'supplier' ? 'Nhà cung cấp' : 'Thành viên'}
        </h2>
        <p className="text-slate-500">
          {role === "supplier"
            ? "Trở thành đối tác và phát triển kinh doanh cùng chúng tôi."
            : "Tạo tài khoản để nhận ưu đãi và quản lý chuyến đi dễ dàng."}
        </p>
      </div>

      {err && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
          <span className="font-bold">!</span> {err}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
          <div className="relative group">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="Ví dụ: Nguyễn Văn A"
              required
            />
          </div>
        </div>

        {/* Username */}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-slate-700">Tên đăng nhập</label>
          <div className="relative group">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
              placeholder="username123"
              required
            />
          </div>
        </div>

        {/* --- GRID: Email & Phone Number --- */}
        {/* Tôi chia cột ở đây để giao diện gọn hơn, bạn có thể để full-width nếu thích */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* <--- 4. UI INPUT SỐ ĐIỆN THOẠI MỚI */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Số điện thoại</label>
            <div className="relative group">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="0905xxxxxx"
                required
              />
            </div>
          </div>
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="passWord"
                value={formData.passWord}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="Min 6 ký tự"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700">Xác nhận</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all bg-slate-50 focus:bg-white"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input
            id="terms"
            name="agreeToTerms"
            type="checkbox"
            required
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
            Tôi đồng ý với <span className="font-semibold text-cyan-600 hover:underline">Điều khoản & Chính sách</span>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/30 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none transition-all transform active:scale-[0.98] disabled:opacity-70 mt-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Đăng ký ngay"}
        </button>
      </form>
    </div>
  );
}

// --- COMPONENT CON 2: STEP 2 - OTP VERIFICATION ---
function OTPForm({ email, onVerify, onResend, loading }) {
  const [otp, setOtp] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length < 6) return alert("Mã OTP phải có 6 ký tự");
    onVerify(otp);
  };

  return (
    <div className="w-full text-center animate-in fade-in slide-in-from-right-4 duration-500 py-6">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 animate-bounce-slow">
        <ShieldCheck className="w-10 h-10" />
      </div>

      <h2 className="text-3xl font-bold text-slate-900 mb-2">Xác thực tài khoản</h2>
      <p className="text-slate-500 max-w-xs mx-auto mb-8">
        Nhập mã 6 số chúng tôi vừa gửi đến <br /><span className="font-bold text-slate-800">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xs mx-auto">
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
          className="w-full text-center text-3xl tracking-[0.5em] font-bold py-4 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all text-slate-800 placeholder:text-slate-200"
          placeholder="000000"
          autoFocus
          required
        />

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:to-cyan-600 transition-all disabled:opacity-70">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Xác nhận"}
        </button>

        <div className="text-sm text-slate-500">
          Chưa nhận được mã? <button type="button" onClick={onResend} className="font-semibold text-cyan-600 hover:underline ml-1">Gửi lại ngay</button>
        </div>
      </form>
    </div>
  );
}

// --- COMPONENT CON 3: STEP 3 - WALLET SETUP ---
function WalletForm({ userId, onSubmit, loading }) {
  const [walletData, setWalletData] = useState({
    accountNumber: "",
    bankName: "",
    accountName: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWalletData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <CreditCard className="text-green-600" /> Thông tin thanh toán
        </h2>
        <p className="text-slate-500 text-sm">
          Cung cấp tài khoản ngân hàng để nhận doanh thu từ việc bán tour.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmit(walletData); }} className="space-y-5 bg-slate-50 p-6 rounded-2xl border border-slate-100">

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Ngân hàng</label>
          <div className="relative group">
            <Building2 className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <input type="text" name="bankName" value={walletData.bankName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-white font-medium uppercase" placeholder="MB BANK" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Số tài khoản</label>
          <div className="relative group">
            <CreditCard className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <input type="text" name="accountNumber" value={walletData.accountNumber} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-white font-medium tracking-wide" placeholder="0123456789" required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Chủ tài khoản</label>
          <div className="relative group">
            <User className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-green-600 transition-colors" />
            <input type="text" name="accountName" value={walletData.accountName} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all bg-white font-medium uppercase" placeholder="NGUYEN VAN A" required />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl shadow-lg shadow-green-500/20 text-sm font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none transition-all disabled:opacity-70 mt-4">
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Hoàn tất & Đăng nhập"}
        </button>
      </form>
    </div>
  );
}

// --- MAIN WIZARD COMPONENT ---
export default function SignupWizard({ role = "user", onBack }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState({ userId: null, email: "" });
  const navigate = useNavigate();

  // --- LOGIC STEP 1 ---
  const handleRegister = async (formData, email) => {
    setLoading(true);
    try {
      // Gửi FormData (đã chứa 'role') lên API
      const res = await axios.post(`${API_URL}/auth/Register`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("👉 Response:", res.data);
      // Logic lấy ID linh hoạt
      const userId = res.data?.data?.userId || res.data?.data?.user?.userId || res.data?.userId;

      if (!userId) {
        console.error("❌ Missing userId in response", res.data);
        alert("Đăng ký thành công nhưng lỗi hệ thống (missing ID).");
        return;
      }

      setRegisteredData({ userId, email });
      await axios.post(`${API_URL}/auth/request-verify-user-register-otp`, { email });
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Đăng ký thất bại.");
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC STEP 2 ---
  const handleVerifyOTP = async (otp) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-user-register-otp`, {
        email: registeredData.email,
        otp
      });
      // Nếu là Supplier -> Step 3, User -> Xong
      if (role === "supplier") {
        setStep(3);
      } else {
        navigate("/auth/login");
      }
    } catch (err) {
      alert("Mã OTP không chính xác.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await axios.post(`${API_URL}/auth/request-verify-user-register-otp`, { email: registeredData.email });
      alert("Đã gửi lại mã OTP.");
    } catch (err) { alert("Lỗi gửi lại mã."); }
  };

  // --- LOGIC STEP 3 ---
  const handleCreateWallet = async (walletData) => {
    if (!registeredData.userId) return setStep(1);
    setLoading(true);
    try {
      const payload = { userId: registeredData.userId, ...walletData };
      // GỌI API TRỰC TIẾP bằng axios thay vì import hàm bên ngoài
      await axios.post(`${API_URL}/accounts`, payload);

      alert("Tạo ví thành công!");
      navigate("/auth/login");
    } catch (err) {
      if (err.response?.data?.message?.includes("Duplicate")) {
        // Nếu đã có ví rồi (do request trước đó) thì vẫn cho qua
        navigate("/auth/login");
      } else {
        alert("Lỗi tạo ví.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) return;
    if (onBack) onBack(); else navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Back Button */}
      {step === 1 && (
        <button onClick={handleBack} className="absolute top-6 left-6 text-slate-500 flex items-center gap-2 hover:text-blue-600 font-medium transition-colors">
          <ChevronLeft className="w-5 h-5" /> Trang chủ
        </button>
      )}

      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 min-h-[600px] animate-in fade-in zoom-in-95 duration-500">

        {/* LEFT SIDE: Inspirational Image */}
        <div className="hidden md:flex w-5/12 relative bg-slate-800">
          <img
            src="/images/login-img.png"
            alt="Travel"
            className="object-cover w-full h-full opacity-80"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000&auto=format&fit=crop"; }}
          />
          {/* Overlay Content */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent p-10 flex flex-col justify-end text-white">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2 opacity-80">
                <Plane className="w-5 h-5" />
                <span className="text-sm font-semibold tracking-wider uppercase">Bookings</span>
              </div>
              <h3 className="text-3xl font-bold leading-tight">
                {step === 1 ? "Khám phá thế giới theo cách của bạn" : step === 2 ? "Bảo mật tài khoản" : "Đối tác tin cậy"}
              </h3>
            </div>

            {/* Simple Step Indicator */}
            <div className="flex gap-2">
              {[1, 2, ...(role === "supplier" ? [3] : [])].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? "bg-cyan-400" : "bg-white/20"}`}></div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Dynamic Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-14 flex flex-col justify-center bg-white relative">
          {step === 1 && <SignupForm role={role} onNext={handleRegister} loading={loading} />}
          {step === 2 && <OTPForm email={registeredData.email} onVerify={handleVerifyOTP} onResend={handleResendOTP} loading={loading} />}
          {step === 3 && <WalletForm userId={registeredData.userId} onSubmit={handleCreateWallet} loading={loading} />}

          {step === 1 && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                Đã có tài khoản? <span onClick={() => navigate("/auth/login")} className="font-bold text-blue-600 hover:text-cyan-600 hover:underline cursor-pointer transition-colors">Đăng nhập ngay</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}