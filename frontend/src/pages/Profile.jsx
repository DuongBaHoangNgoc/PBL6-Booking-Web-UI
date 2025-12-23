"use client"

import React, { useState, useEffect, useCallback } from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import {
  Edit2,
  CreditCard,
  Ticket,
  X,
  Plus,
  Upload,
  Award as IdCard,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  CheckCircle2,
  Camera,
  ArrowRight,
  ShieldCheck,
  Settings,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertCircle
} from "lucide-react"
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, subMonths, addMonths } from "date-fns"

// KHÔI PHỤC LOGIC API VÀ CONTEXT CŨ
import { getUserById, updateUser } from "../api/user"
import { useAuth } from "@/context/useAuth"

/**
 * 🎨 UI COMPONENTS (STYLE ĐỒNG BỘ VỚI SUPPLIER LAYOUT)
 */
const cn = (...classes) => classes.filter(Boolean).join(" ");

const StyledCard = ({ children, className = "" }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>{children}</div>
);

const CardHeader = ({ children, className = "" }) => (
  <div className={cn("p-6 border-b border-slate-100 bg-slate-50/50", className)}>{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={cn("text-sm font-bold text-slate-700 flex items-center gap-2", className)}>{children}</h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={cn("p-6", className)}>{children}</div>
);

const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-xs font-semibold text-slate-500 mb-1.5 block">{children}</label>
);

const StyledButton = ({ children, onClick, className = "", variant = "primary", disabled = false, size = "md", type = "button" }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-500 font-medium",
    destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all active:scale-[0.98] disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </button>
  );
};

const CustomInput = ({ className = "", icon: Icon = null, id, ...props }) => (
  <div className="relative w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
    <input id={id} className={cn("w-full pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all outline-none text-slate-700 placeholder:text-slate-400 bg-white", Icon ? 'pl-10' : 'pl-4', className)} {...props} />
  </div>
);

const Badge = ({ children, className = "" }) => (
  <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap", className)}>{children}</span>
);

/**
 * CALENDAR COMPONENT
 */
const MiniCalendar = ({ selectedDate, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const days = [];
  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  let day = start;
  while (day <= end) { days.push(day); day = addDays(day, 1); }

  return (
    <div className="p-4 w-64 bg-white border border-slate-200 rounded-xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4 text-slate-400" /></button>
        <span className="text-xs font-bold text-slate-700">{format(currentMonth, "MMMM yyyy")}</span>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight className="w-4 h-4 text-slate-400" /></button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>
        ))}
        {days.map((d, i) => (
          <button
            key={i}
            onClick={() => onSelect(d)}
            className={cn(
              "h-8 w-8 text-[11px] font-medium rounded-lg transition-all flex items-center justify-center",
              !isSameMonth(d, currentMonth) && "text-slate-200",
              isSameDay(d, selectedDate) ? "bg-blue-600 text-white shadow-sm" : "hover:bg-slate-50 text-slate-600"
            )}
          >
            {format(d, "d")}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * ✅ Profile Component
 */
export function Profile() {
  const { user, setUser, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("account")
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)

  const [form, setForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    dateOfBirth: user?.birthDay ? new Date(user.birthDay) : null,
    role: user?.role || "user",
    isActive: user?.isActive || "n",
  })

  const fetchProfile = useCallback(async () => {
    if (!user?.userId && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true)
      const data = await getUserById(user.userId || user.id)
      setForm({
        ...data,
        dateOfBirth: data.birthDay ? new Date(data.birthDay) : null,
      })
    } catch {
      console.error("Lỗi khi tải dữ liệu")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const [newCard, setNewCard] = useState({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" })
  const [savedCards, setSavedCards] = useState([
    { id: 1, last4: "4321", brand: "Visa", expiryDate: "12/25" },
    { id: 2, last4: "5678", brand: "Mastercard", expiryDate: "08/26" },
  ])

  const [bookings] = useState([
    { id: 1, reference: "BK-001", hotel: "Vịnh Hạ Long - Tour 2N1Đ", checkIn: "15 Th12", checkOut: "18 Th12", price: "2.500.000đ", status: "Confirmed" },
    { id: 2, reference: "BK-002", hotel: "Đà Nẵng City Tour", checkIn: "10 Th01", checkOut: "15 Th01", price: "1.200.000đ", status: "Upcoming" },
  ])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const payload = {
        ...form,
        birthDay: form.dateOfBirth ? format(form.dateOfBirth, "yyyy-MM-dd") : null,
      }
      delete payload.dateOfBirth
      const updated = await updateUser(user.userId || user.id, payload)
      const preparedData = { ...form, ...updated, dateOfBirth: updated.birthDay ? new Date(updated.birthDay) : null }
      setUser(preparedData)
      setForm(preparedData)
      setIsEditing(false)
      alert("✅ Cập nhật thông tin thành công!")
    } catch {
      alert("❌ Lỗi khi cập nhật thông tin!")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    fetchProfile()
  }

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, dateOfBirth: date }))
  }

  const handleCardChange = (e) => {
    const { name, value } = e.target
    setNewCard((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.expiryDate && newCard.cvv && newCard.cardholderName) {
      const last4 = newCard.cardNumber.slice(-4)
      setSavedCards([...savedCards, { id: Date.now(), last4, brand: "Visa", expiryDate: newCard.expiryDate }])
      setNewCard({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" })
      setShowAddCard(false)
    }
  }

  const handleRemoveCard = (cardId) => {
    setSavedCards(savedCards.filter((card) => card.id !== cardId))
  }

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-medium text-slate-400 tracking-wider">Đang đồng bộ hồ sơ...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-8">

      {/* 1. PROFILE HEADER SECTION */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: '24px 24px' }} />
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white p-1.5 shadow-md">
              <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center text-blue-600 font-bold text-4xl">
                {form.fullName?.charAt(0) || "U"}
              </div>
            </div>
            <button className="absolute bottom-1 right-1 w-9 h-9 rounded-xl bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all border-2 border-white">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left mb-2">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-bold text-slate-800">{form.fullName}</h1>
              {form.isActive === "y" && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
            </div>
            <p className="text-slate-500 text-sm font-medium mt-1">{form.email} • {form.role}</p>
          </div>

          <div className="mb-2">
            {!isEditing ? (
              <StyledButton onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="w-4 h-4" /> Chỉnh sửa hồ sơ
              </StyledButton>
            ) : (
              <div className="flex gap-2">
                <StyledButton variant="outline" onClick={handleCancel}>Hủy</StyledButton>
                <StyledButton onClick={handleSave}>Lưu thay đổi</StyledButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. TABS NAVIGATION */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'account', label: 'Tài khoản', icon: User },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-lg transition-all",
              activeTab === tab.id ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Info Column */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "account" && (
            <StyledCard>
              <CardHeader>
                <CardTitle><Info className="w-4 h-4" /> Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <Label>Họ và Tên</Label>
                  <CustomInput name="fullName" value={form.fullName} onChange={handleChange} disabled={!isEditing} icon={User} className={!isEditing && "bg-slate-50"} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <CustomInput value={form.email} disabled icon={Mail} className="bg-slate-50 cursor-not-allowed" />
                </div>
                <div className="space-y-1">
                  <Label>Số điện thoại</Label>
                  <CustomInput name="phoneNumber" value={form.phoneNumber} onChange={handleChange} disabled={!isEditing} icon={Phone} className={!isEditing && "bg-slate-50"} />
                </div>
                <div className="space-y-1">
                  <Label>Ngày sinh</Label>
                  {isEditing ? (
                    <PopoverPrimitive.Root>
                      <PopoverPrimitive.Trigger asChild>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:border-blue-600 transition-all text-left bg-white">
                          <CalendarIcon className="w-4 h-4 text-slate-400" />
                          {form.dateOfBirth ? format(form.dateOfBirth, "dd/MM/yyyy") : "Chọn ngày sinh"}
                        </button>
                      </PopoverPrimitive.Trigger>
                      <PopoverPrimitive.Portal>
                        <PopoverPrimitive.Content className="z-50 outline-none" align="start" sideOffset={5}>
                          <MiniCalendar selectedDate={form.dateOfBirth} onSelect={handleDateChange} />
                        </PopoverPrimitive.Content>
                      </PopoverPrimitive.Portal>
                    </PopoverPrimitive.Root>
                  ) : (
                    <CustomInput value={form.dateOfBirth ? format(form.dateOfBirth, "dd/MM/yyyy") : "Chưa cập nhật"} disabled icon={CalendarIcon} className="bg-slate-50" />
                  )}
                </div>
                <div className="md:col-span-2 space-y-1">
                  <Label>Địa chỉ</Label>
                  <CustomInput name="address" value={form.address} onChange={handleChange} disabled={!isEditing} icon={MapPin} className={!isEditing && "bg-slate-50"} />
                </div>
              </CardContent>
            </StyledCard>
          )}

          {activeTab === "booking" && (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <StyledCard key={booking.id} className="hover:border-blue-200 transition-colors">
                  <CardContent className="p-5 flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                      <Ticket className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{booking.hotel}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        {booking.checkIn} - {booking.checkOut} • REF: {booking.reference}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{booking.price}</p>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 mt-1">{booking.status}</Badge>
                    </div>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ArrowRight className="w-4 h-4 text-slate-400" /></button>
                  </CardContent>
                </StyledCard>
              ))}
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-bold text-slate-700">Thanh toán & Thẻ</h3>
                <StyledButton size="sm" variant="primary" onClick={() => setShowAddCard(true)}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Thêm thẻ
                </StyledButton>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedCards.map((card) => (
                  <StyledCard key={card.id} className="bg-slate-900 text-white border-none shadow-md hover:scale-[1.02] transition-transform">
                    <CardContent className="p-6 h-44 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.brand}</p>
                          <p className="text-xl font-bold tracking-widest mt-1">•••• {card.last4}</p>
                        </div>
                        <CreditCard className="w-6 h-6 text-slate-600" />
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px]">
                          <p className="text-slate-500 font-bold uppercase">Hết hạn</p>
                          <p className="font-bold mt-0.5">{card.expiryDate}</p>
                        </div>
                        <button onClick={() => handleRemoveCard(card.id)} className="text-[10px] font-bold text-red-400 hover:text-red-300">Gỡ bỏ</button>
                      </div>
                    </CardContent>
                  </StyledCard>
                ))}
              </div>

              {showAddCard && (
                <StyledCard className="bg-blue-50/50 border-2 border-dashed border-blue-200 mt-8 animate-in fade-in slide-in-from-top-4">
                  <CardHeader className="bg-transparent border-none">
                    <div className="flex justify-between items-center">
                      <CardTitle>Liên kết thẻ ngân hàng</CardTitle>
                      <button onClick={() => setShowAddCard(false)}><X className="w-4 h-4 text-slate-400" /></button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <Label>Số thẻ</Label>
                      <CustomInput name="cardNumber" placeholder="0000 0000 0000 0000" value={newCard.cardNumber} onChange={handleCardChange} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Hết hạn (MM/YY)</Label>
                        <CustomInput name="expiryDate" placeholder="12/25" value={newCard.expiryDate} onChange={handleCardChange} />
                      </div>
                      <div className="space-y-1">
                        <Label>CVV</Label>
                        <CustomInput name="cvv" placeholder="•••" value={newCard.cvv} onChange={handleCardChange} />
                      </div>
                    </div>
                    <StyledButton className="w-full mt-4" onClick={handleAddCard}>Xác nhận thêm</StyledButton>
                  </CardContent>
                </StyledCard>
              )}
            </div>
          )}
        </div>

        {/* Sidebar Info Column */}
        <div className="space-y-6">
          <StyledCard>
            <CardHeader>
              <CardTitle><Settings className="w-4 h-4" /> Cài đặt & Bảo mật</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <button className="w-full px-6 py-4 flex items-center justify-between text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <span>Đổi mật khẩu</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </button>
              <button className="w-full px-6 py-4 flex items-center justify-between text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-100">
                <span>Xác thực 2 lớp (2FA)</span>
                <div className="w-8 h-4 bg-slate-200 rounded-full flex items-center px-1"><div className="w-3 h-3 bg-white rounded-full shadow-sm" /></div>
              </button>
              <button className="w-full px-6 py-4 flex items-center justify-between text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors">
                <span>Xóa tài khoản</span>
                <AlertCircle className="w-4 h-4" />
              </button>
            </CardContent>
          </StyledCard>
        </div>
      </div>
    </div>
  )
}

export default Profile;