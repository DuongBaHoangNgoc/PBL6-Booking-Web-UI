import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    passWord: "",
    phoneNumber: "",
    address: "",
    birthDay: "",
    file: null,
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const res = await axios.post(
        "http://localhost:3000/auth/Register",
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("Signup success:", res.data);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error);
      setErr(error.response?.data?.message || "Đăng ký thất bại!");
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
            alt="Signup visual"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Form bên phải */}
        <div className="w-full md:w-1/2 p-8 bg-white/90">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign Up</h2>
          <p className="text-gray-500 mb-6">
            Create your account to explore the world
          </p>

          {err && <div className="mb-4 text-sm text-red-600">{err}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <input
                type="password"
                name="passWord"
                value={formData.passWord}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your password"
                required
              />
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

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
                placeholder="Enter your address"
              />
            </div>

            {/* BirthDay */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Birth Day
              </label>
              <input
                type="date"
                name="birthDay"
                value={formData.birthDay}
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
              />
            </div>

            {/* Upload Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Avatar
              </label>
              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleChange}
                className="mt-1 w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-400"
              />
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
              onClick={() => navigate("/login")}
              className="text-green-500 cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
