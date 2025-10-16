import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { getUserById, updateUser } from "../services/user";

export default function Profile({ user, setUser }) {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!user?.userId && !user?.id) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await getUserById(user.userId || user.id);
        setForm(data);
      } catch {
        setForm(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    try {
      setLoading(true);
      const updated = await updateUser(user.userId || user.id, form);
      setUser(updated);
      alert("✅ Cập nhật thông tin thành công!");
      setEditing(false);
    } catch {
      alert("❌ Lỗi khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải thông tin cá nhân...
      </div>
    );

  if (!form)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy thông tin người dùng
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Nền trang */}
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

      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1 pt-20">
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
            {/* Header */}
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                {form.fullName?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {form.fullName || "Chưa có tên"}
                </h2>
                <p className="text-gray-500">
                  Tài khoản:{" "}
                  <span className="font-medium">{form.userName || "—"}</span>
                </p>
              </div>
            </div>

            {/* Thông tin chi tiết */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField
                icon={<FaEnvelope className="text-blue-500" />}
                label="Email"
                value={form.email}
                editable={editing}
                onChange={(v) => handleChange("email", v)}
              />
              <InfoField
                icon={<FaPhone className="text-green-500" />}
                label="Số điện thoại"
                value={form.phoneNumber}
                editable={editing}
                onChange={(v) => handleChange("phoneNumber", v)}
              />
              <InfoField
                icon={<FaMapMarkerAlt className="text-red-500" />}
                label="Địa chỉ"
                value={form.address}
                editable={editing}
                onChange={(v) => handleChange("address", v)}
              />
              <InfoField
                icon={<FaBirthdayCake className="text-pink-500" />}
                label="Ngày sinh"
                value={
                  form.birthDay
                    ? new Date(form.birthDay).toLocaleDateString("vi-VN")
                    : "—"
                }
                editable={editing}
                onChange={(v) => handleChange("birthDay", v)}
              />
            </div>

            {/* Nút hành động */}
            <div className="mt-8 flex flex-wrap gap-4">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="border border-gray-400 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg font-semibold"
                  >
                    Huỷ
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
                >
                  Cập nhật thông tin
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/* === Field component === */
function InfoField({ icon, label, value, editable, onChange }) {
  return (
    <div className="flex items-center border rounded-lg p-4 bg-gray-50">
      <div className="w-10 h-10 flex items-center justify-center bg-white rounded-full shadow mr-3">
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        {editable ? (
          <input
            type="text"
            className="w-full mt-1 border rounded px-2 py-1 text-gray-800"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <div className="font-medium text-gray-800">{value || "—"}</div>
        )}
      </div>
    </div>
  );
}
