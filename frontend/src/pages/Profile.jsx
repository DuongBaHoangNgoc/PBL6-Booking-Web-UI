"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit2, CreditCard, Ticket, X, Plus, Upload, Award as IdCard } from "lucide-react"
import { getUserById, updateUser } from "../api/user"
import Navbar from "@/components/layout/Header"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/context/useAuth"

export function Profile() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("account")
  const [isEditing, setIsEditing] = useState(false)
  const [showAddCard, setShowAddCard] = useState(false)

  const [form, setForm] = useState({
    fullName: user?.fullName || "Phuc TX",
    email: user?.email || "tx.phuc.dev@gmail.com",
    phoneNumber: user?.phoneNumber || "+1 000-000-0000",
    address: user?.address || "St 32 main downtown, Los Angeles, California, USA",
    dateOfBirth: user?.birthDay ? new Date(user.birthDay) : null,
    role: user?.role || "user",
    isActive: user?.isActive || "n",
  })

  const fetchProfile = async () => {
    if (!user?.userId && !user?.id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getUserById(user.userId || user.id)

      const preparedData = {
        ...data,
        dateOfBirth: data.birthDay ? new Date(data.birthDay) : null,
      }
      setForm(preparedData)
    } catch {
      setForm(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user])

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

  const [savedCards, setSavedCards] = useState([
    { id: 1, last4: "4321", brand: "Visa", expiryDate: "12/25" },
    { id: 2, last4: "5678", brand: "Mastercard", expiryDate: "08/26" },
  ])

  const [bookings] = useState([
    {
      id: 1,
      reference: "BK-001",
      hotel: "CVK Park Bosphorus Hotel",
      checkIn: "Dec 15",
      checkOut: "Dec 18",
      price: "$240",
      status: "Confirmed",
    },
    {
      id: 2,
      reference: "BK-002",
      hotel: "Ereisin Hotels Sultanahmet",
      checkIn: "Jan 10",
      checkOut: "Jan 15",
      price: "$180",
      status: "Upcoming",
    },
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

      const preparedData = {
        ...form,
        ...updated,
        dateOfBirth: updated.birthDay ? new Date(updated.birthDay) : null,
      }
      setUser(preparedData)
      setForm(preparedData)
      alert("✅ Cập nhật thông tin thành công!")
      setIsEditing(false)
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
      setSavedCards([
        ...savedCards,
        { id: savedCards.length + 1, last4, brand: "Visa", expiryDate: newCard.expiryDate },
      ])
      setNewCard({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" })
      setShowAddCard(false)
      alert("✅ Card added successfully!")
    }
  }

  const handleRemoveCard = (cardId) => {
    setSavedCards(savedCards.filter((card) => card.id !== cardId))
    alert("✅ Card removed successfully!")
  }

  const handleUploadCover = () => {
    alert("📸 Upload cover image functionality - Coming soon!")
  }

  const handleEditAvatar = () => {
    alert("✏️ Edit avatar functionality - Coming soon!")
  }

  const handleViewBookingDetails = (bookingId) => {
    alert(`📋 Viewing details for booking ${bookingId}`)
  }

  const { loading: authLoading } = useAuth()
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải thông tin cá nhân...</div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy thông tin người dùng
      </div>
    )
  }

  return (
    <section className="py-12 bg-gradient-to-b from-[#f0faf9] to-white overscroll-y-scroll">
      <div className="flex flex-1">
        <main className="flex-1 p-6 md:p-14 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8 mt-10">
            <div className="container mx-auto">
              <div className="mb-8">
                <div className="relative h-48 rounded-xl overflow-hidden mb-20 shadow-md">
                  <div
                    className="absolute top-0 left-0 right-0 bottom-0 rounded-xl"
                    style={{
                      backgroundImage: `linear-gradient(135deg, #1a5f7a 0%, #1a5f7a 25%, #ff7a5c 25%, #ff7a5c 50%, #ffc857 50%, #ffc857 75%, #ffd166 75%, #ffd166 100%)`,
                    }}
                  ></div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUploadCover}
                    className="absolute top-4 right-4 bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] border-0 gap-2 font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    Upload new cover
                  </Button>
                </div>

                <div className="flex flex-col items-center -mt-16 mb-8">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full bg-white border-4 border-[#5dd9c1] flex items-center justify-center shadow-xl">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#5dd9c1] to-[#1a5f7a] flex items-center justify-center">
                        <span className="text-4xl font-bold text-white">
                          {user?.fullName
                            ? user.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase()
                            : "JD"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={handleEditAvatar}
                      className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#5dd9c1] hover:bg-[#4bc9b0] flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <Edit2 className="w-5 h-5 text-[#1a5f7a]" />
                    </button>
                  </div>

                  <h1 className="text-3xl font-bold text-[#1a5f7a] mt-4">{form.fullName}</h1>
                  <p className="text-[#5dd9c1] font-medium">{form.email}</p>
                </div>

                <div className="flex border-b-2 border-[#e8f5f3] mt-8">
                  <button
                    onClick={() => setActiveTab("account")}
                    className={`flex-1 pb-4 font-semibold transition-all duration-300 ${
                      activeTab === "account"
                        ? "text-[#1a5f7a] border-b-2 border-[#5dd9c1] -mb-[2px]"
                        : "text-[#999] hover:text-[#1a5f7a]"
                    }`}
                  >
                    Account
                  </button>
                  <button
                    onClick={() => setActiveTab("booking")}
                    className={`flex-1 pb-4 font-semibold transition-all duration-300 ${
                      activeTab === "booking"
                        ? "text-[#1a5f7a] border-b-2 border-[#5dd9c1] -mb-[2px]"
                        : "text-[#999] hover:text-[#1a5f7a]"
                    }`}
                  >
                    Bookings
                  </button>
                  <button
                    onClick={() => setActiveTab("payments")}
                    className={`flex-1 pb-4 font-semibold transition-all duration-300 ${
                      activeTab === "payments"
                        ? "text-[#1a5f7a] border-b-2 border-[#5dd9c1] -mb-[2px]"
                        : "text-[#999] hover:text-[#1a5f7a]"
                    }`}
                  >
                    Payment methods
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="mt-8">
                {/* Account Tab */}
                {activeTab === "account" && (
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-[#1a5f7a] mb-8">Account Information</h2>

                    <div className="space-y-6">
                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#5dd9c1] to-[#1a5f7a] flex items-center justify-center shrink-0">
                            <IdCard className="w-5 h-5 text-white" />
                          </div>

                          <div>
                            <p className="text-sm text-[#999] font-medium">Role</p>
                            <p className="text-lg font-semibold text-[#1a5f7a] capitalize">{form.role || "N/A"}</p>
                          </div>
                        </div>

                        <div>
                          {form.isActive === "y" ? (
                            <Badge className="bg-[#5dd9c1] text-[#1a5f7a] px-3 py-1 text-sm font-semibold border-0">
                              ✓ Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="px-3 py-1 text-sm font-semibold">
                              Not Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-[#999] font-medium mb-2">Fullname</p>
                          {isEditing ? (
                            <input
                              type="text"
                              name="fullName"
                              value={form.fullName}
                              onChange={handleChange}
                              className="text-lg font-semibold text-[#1a5f7a] outline-none border-b-2 border-[#5dd9c1] pb-1 bg-transparent w-full"
                              autoFocus
                            />
                          ) : (
                            <p className="text-lg font-semibold text-[#1a5f7a]">{form.fullName}</p>
                          )}
                        </div>
                      </div>

                      {/* Email Field */}
                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-[#999] font-medium mb-2">Email</p>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="text-lg font-semibold text-[#1a5f7a] outline-none border-b-2 border-[#5dd9c1] pb-1 bg-transparent w-full"
                              disabled
                            />
                          ) : (
                            <p className="text-lg font-semibold text-[#1a5f7a]">{form.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Phone Field */}
                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-[#999] font-medium mb-2">Phone number</p>
                          {isEditing ? (
                            <input
                              type="tel"
                              name="phoneNumber"
                              value={form.phoneNumber}
                              onChange={handleChange}
                              className="text-lg font-semibold text-[#1a5f7a] outline-none border-b-2 border-[#5dd9c1] pb-1 bg-transparent w-full"
                              autoFocus
                            />
                          ) : (
                            <p className="text-lg font-semibold text-[#1a5f7a]">{form.phoneNumber}</p>
                          )}
                        </div>
                      </div>

                      {/* Address Field */}
                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-[#999] font-medium mb-2">Address</p>
                          {isEditing ? (
                            <input
                              type="text"
                              name="address"
                              value={form.address}
                              onChange={handleChange}
                              className="text-lg font-semibold text-[#1a5f7a] outline-none border-b-2 border-[#5dd9c1] pb-1 bg-transparent w-full"
                              autoFocus
                            />
                          ) : (
                            <p className="text-lg font-semibold text-[#1a5f7a]">{form.address}</p>
                          )}
                        </div>
                      </div>

                      {/* Date of Birth Field */}
                      <div
                        className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-[#e8f5f3]" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="text-sm text-[#999] font-medium mb-2">Date of birth</p>
                          {isEditing ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] justify-start text-left font-semibold border-[#5dd9c1] text-[#1a5f7a] hover:bg-[#e8f5f3]",
                                    !form.dateOfBirth && "text-[#999]",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {form.dateOfBirth ? (
                                    format(form.dateOfBirth, "dd/MM/yyyy")
                                  ) : (
                                    <span>Chọn ngày sinh</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={form.dateOfBirth}
                                  onSelect={handleDateChange}
                                  initialFocus
                                  captionLayout="dropdown-buttons"
                                  fromYear={1950}
                                  toYear={new Date().getFullYear()}
                                />
                              </PopoverContent>
                            </Popover>
                          ) : (
                            <p className="text-lg font-semibold text-[#1a5f7a]">
                              {form.dateOfBirth ? format(form.dateOfBirth, "dd/MM/yyyy") : "N/A"}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                      {isEditing ? (
                        <>
                          <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="border-[#5dd9c1] text-[#1a5f7a] hover:bg-[#e8f5f3] bg-transparent"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSave}
                            className="bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                          >
                            Save Changes
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => setIsEditing(true)}
                          className="bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                        >
                          Change Information
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "booking" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#1a5f7a]">Tickets/Bookings</h2>
                      <select className="border-2 border-[#5dd9c1] rounded-lg px-4 py-2 bg-white text-[#1a5f7a] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#5dd9c1]">
                        <option>Upcoming</option>
                        <option>Past</option>
                        <option>All</option>
                      </select>
                    </div>

                    {bookings.map((booking) => (
                      <Card
                        key={booking.id}
                        className="p-6 flex items-center justify-between hover:shadow-lg transition-all duration-200 border-l-4 border-[#5dd9c1]"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-lg bg-[#5dd9c1]/20 flex items-center justify-center">
                            <Ticket className="w-6 h-6 text-[#1a5f7a]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#1a5f7a]">{booking.hotel}</h3>
                            <p className="text-sm text-[#999]">
                              {booking.checkIn} - {booking.checkOut}
                            </p>
                            <p className="text-xs text-[#999] mt-1">Ref: {booking.reference}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-bold text-[#ff6b6b] text-lg">{booking.price}</p>
                            <p className="text-xs text-[#999]">{booking.status}</p>
                          </div>
                          <Button
                            onClick={() => handleViewBookingDetails(booking.id)}
                            className="bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-semibold transition-all duration-200 hover:shadow-md"
                          >
                            View Details
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {activeTab === "payments" && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#1a5f7a]">Payment methods</h2>
                      <Button
                        onClick={() => setShowAddCard(true)}
                        className="bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] gap-2 font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        Add a new Card
                      </Button>
                    </div>

                    {/* Saved Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {savedCards.map((card) => (
                        <Card
                          key={card.id}
                          className="p-6 bg-gradient-to-br from-[#5dd9c1] to-[#1a5f7a] text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-12">
                            <div>
                              <p className="text-sm opacity-80 font-medium">{card.brand}</p>
                              <p className="text-lg font-semibold">•••• {card.last4}</p>
                            </div>
                            <CreditCard className="w-8 h-8 opacity-80" />
                          </div>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-xs opacity-80">Expires</p>
                              <p className="font-semibold">{card.expiryDate}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveCard(card.id)}
                              className="bg-white/20 hover:bg-white/30 text-white border-white/30 font-semibold transition-all duration-200"
                            >
                              Remove
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {showAddCard && (
                      <Card className="p-8 border-2 border-[#5dd9c1] bg-[#f0faf9]">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-bold text-[#1a5f7a]">Add a new Card</h3>
                          <button
                            onClick={() => setShowAddCard(false)}
                            className="text-[#999] hover:text-[#1a5f7a] transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="space-y-4 max-w-md">
                          <div>
                            <label className="text-sm font-semibold text-[#1a5f7a] block mb-2">Card Number</label>
                            <input
                              type="text"
                              name="cardNumber"
                              placeholder="1234 5678 9012 3456"
                              value={newCard.cardNumber}
                              onChange={handleCardChange}
                              className="w-full border-2 border-[#5dd9c1] rounded-lg px-3 py-2 outline-none bg-white text-[#1a5f7a] font-medium focus:ring-2 focus:ring-[#5dd9c1]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-semibold text-[#1a5f7a] block mb-2">Expiry Date</label>
                              <input
                                type="text"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={newCard.expiryDate}
                                onChange={handleCardChange}
                                className="w-full border-2 border-[#5dd9c1] rounded-lg px-3 py-2 outline-none bg-white text-[#1a5f7a] font-medium focus:ring-2 focus:ring-[#5dd9c1]"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-[#1a5f7a] block mb-2">CVV</label>
                              <input
                                type="text"
                                name="cvv"
                                placeholder="123"
                                value={newCard.cvv}
                                onChange={handleCardChange}
                                className="w-full border-2 border-[#5dd9c1] rounded-lg px-3 py-2 outline-none bg-white text-[#1a5f7a] font-medium focus:ring-2 focus:ring-[#5dd9c1]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-sm font-semibold text-[#1a5f7a] block mb-2">Cardholder Name</label>
                            <input
                              type="text"
                              name="cardholderName"
                              placeholder="John Doe"
                              value={newCard.cardholderName}
                              onChange={handleCardChange}
                              className="w-full border-2 border-[#5dd9c1] rounded-lg px-3 py-2 outline-none bg-white text-[#1a5f7a] font-medium focus:ring-2 focus:ring-[#5dd9c1]"
                            />
                          </div>

                          <Button
                            onClick={handleAddCard}
                            className="w-full bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                          >
                            Add card
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  )
}
