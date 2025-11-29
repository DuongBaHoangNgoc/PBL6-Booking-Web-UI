import { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Upload, 
  Image as ImageIcon,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Signup({ role = "user", onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State form data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passWord: "",
    confirmPassword: "",
    phoneNumber: "",
    avatar: null, // Thêm trường avatar
    agreeToTerms: false,
  });

  // State preview ảnh
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // Cleanup URL preview khi unmount để tránh memory leak
  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  // Xử lý thay đổi input thường
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý riêng cho upload ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate loại file (chỉ cho phép ảnh)
      if (!file.type.startsWith("image/")) {
        setErr("Vui lòng chỉ chọn file hình ảnh (jpg, png, jpeg).");
        return;
      }
      // Validate dung lượng (ví dụ < 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErr("Kích thước ảnh không được vượt quá 5MB.");
        return;
      }

      setFormData((prev) => ({ ...prev, avatar: file }));
      setErr(""); // Xóa lỗi cũ nếu có

      // Tạo URL preview
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // --- Validation Client-side ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErr("Địa chỉ email không hợp lệ!");
      return;
    }
    if (formData.passWord !== formData.confirmPassword) {
      setErr("Mật khẩu xác nhận không trùng khớp!");
      return;
    }
    if (formData.passWord.length < 6) {
      setErr("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }
    if (!formData.agreeToTerms) {
      setErr("Bạn phải đồng ý với Điều khoản Dịch vụ.");
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      // Append các trường text
      form.append("fullName", formData.fullName);
      form.append("email", formData.email);
      form.append("passWord", formData.passWord);
      form.append("phoneNumber", formData.phoneNumber);
      form.append("role", role);
      
      // Append file ảnh (nếu có)
      if (formData.avatar) {
        form.append("file", formData.avatar);
      }

      // Gọi API đăng ký
      const res = await axios.post(
        "http://localhost:3000/auth/Register",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Signup success:", res.data);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErr(error.response?.data?.message || "Đăng ký thất bại! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý điều hướng nút Back
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/");
    }
  };

  return (
      <div className="flex w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500 my-8">
        
        {/* Cột trái: Hình ảnh & Welcome Message (Ẩn trên mobile) */}
        <div className="hidden md:block w-5/12 relative bg-slate-100">
          <img
            src="/images/login-img.png"
            alt="Signup visual"
            className="object-cover w-full h-full absolute inset-0"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=1000&auto=format&fit=crop"; 
            }}
          />
          {/* Lớp phủ gradient Xanh */}
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent flex flex-col justify-end p-10 text-white">
            <h3 className="text-3xl font-bold mb-3">Join Us Today!</h3>
            <p className="text-blue-50 text-base leading-relaxed opacity-90">
              Create an account to unlock exclusive tours, manage your bookings, and start your dream journey.
            </p>
          </div>
        </div>

        {/* Cột phải: Form đăng ký */}
        <div className="w-full md:w-7/12 p-8 md:p-12 bg-white">
          <div className="mb-8">
             <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
             <p className="text-slate-500">
               {role === "supplier" ? "Register as a Tour Supplier" : "Sign up to start exploring"}
             </p>
          </div>

          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
              <div className="mt-0.5 font-bold">⚠️</div>
              <div>{err}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            
            {/* --- AVATAR UPLOAD SECTION --- */}
            <div className="flex justify-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 shadow-md bg-slate-50 flex items-center justify-center">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-300" />
                  )}
                </div>
                
                <label 
                  htmlFor="avatar-upload" 
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-500 transition-colors shadow-lg border-2 border-white"
                  title="Upload Avatar"
                >
                  <Upload className="w-4 h-4" />
                </label>
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Phone</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                    placeholder="+84 123..."
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            {/* Password - Đã tách thành dòng riêng */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="passWord"
                  value={formData.passWord}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                  placeholder="Min. 6 chars"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password - Đã tách thành dòng riêng */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-cyan-600 transition-colors" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
                I agree to the{" "}
                <a href="#" className="font-semibold text-blue-600 hover:text-cyan-600 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-blue-600 hover:text-cyan-600 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all transform active:scale-[0.98] mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{" "}
              <Link to="/auth/login" className="font-bold text-blue-600 hover:text-cyan-600 hover:underline transition-colors">
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
}