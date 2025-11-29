import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup({ role, onBack }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passWord: "",
    confirmPassword: "",
    phoneNumber: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

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
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });
      form.delete("confirmPassword");
      form.delete("agreeToTerms");
      form.append("role", role);

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
      setErr(error.response?.data?.message || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="flex w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden my-8">
        {/* Ảnh bên trái */}
        <div className="hidden md:block w-1/2">
          <img
            src="/images/login-img.png"
            alt="Signup visual"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Form bên phải */}
        <div className="w-full md:w-1/2 p-8 bg-white/90">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          {/* Form Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Your Account
            </h1>
            <p className="text-muted-foreground">
              {role === "supplier"
                ? "Set up your tour operator account"
                : "Start exploring amazing tours"}
            </p>
          </div>

          {err && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {err}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="passWord"
                  value={formData.passWord}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  placeholder="Enter your password (min. 6 characters)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your phone number"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start gap-3 pt-2">
              <input
                id="terms"
                name="agreeToTerms"
                type="checkbox"
                required
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-gray-300 cursor-pointer accent-green-500"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-600 cursor-pointer"
              >
                I agree to the{" "}
                <a href="#" className="font-semibold text-green-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="font-semibold text-green-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-400 text-white py-2 rounded-lg hover:bg-green-500 transition disabled:opacity-60"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/auth/login")}
              className="text-green-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
  );
}
