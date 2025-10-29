import { useState, useEffect } from "react"; 
import { Card } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { Edit2, CreditCard, Ticket, X, Plus, Upload, IdCard } from "lucide-react";
import { getUserById, updateUser } from "../../../api/user";
import Navbar from "@/components/layout/Navbar";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge"; 

export function Profile({ user, setUser }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("account"); 
  const [isEditing, setIsEditing] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || "Phuc TX",
    email: user?.email || "tx.phuc.dev@gmail.com",
    phoneNumber: user?.phoneNumber || "+1 000-000-0000",
    address: user?.address || "St 32 main downtown, Los Angeles, California, USA",
    dateOfBirth: user?.birthDay ? new Date(user.birthDay) : null,
    role: user?.role || "user",
    isActive: user?.isActive || "n",
  });

  const fetchProfile = async () => {
    if (!user?.userId && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getUserById(user.userId || user.id);

      const preparedData = {
        ...data,
        dateOfBirth: data.birthDay ? new Date(data.birthDay) : null,
      }
      setForm(preparedData);
    } catch {
      setForm(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const [newCard, setNewCard] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const [savedCards, setSavedCards] = useState([
    { id: 1, last4: "4321", brand: "Visa", expiryDate: "12/25" },
    { id: 2, last4: "5678", brand: "Mastercard", expiryDate: "08/26" },
  ]);

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
  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        ...form,
        birthDay: form.dateOfBirth ? format(form.dateOfBirth, "yyyy-MM-dd") : null,
      };
      delete payload.dateOfBirth;
      const updated = await updateUser(user.userId || user.id, payload);

      const preparedData = {
        ...form,
        ...updated,
        dateOfBirth: updated.birthDay ? new Date(updated.birthDay) : null,
      }
      setUser(preparedData);
      setForm(preparedData);
      alert("✅ Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch {
      alert("❌ Lỗi khi cập nhật thông tin!");
    } finally {
      setLoading(false);
    }
  }

  const handleCancel = () => {
    setIsEditing(false);
    fetchProfile();
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({ ...prev, dateOfBirth: date }));
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setNewCard((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.expiryDate && newCard.cvv && newCard.cardholderName) {
      const last4 = newCard.cardNumber.slice(-4);
      setSavedCards([
        ...savedCards,
        { id: savedCards.length + 1, last4, brand: "Visa", expiryDate: newCard.expiryDate },
      ]);
      setNewCard({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" });
      setShowAddCard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải thông tin cá nhân...
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Không tìm thấy thông tin người dùng
      </div>
    );
  }

  return (
    <section className="py-12 bg-background h-screen overscroll-y-scroll">
      <Navbar user={user} setUser={setUser} />

      <div className="flex flex-1">
         <main className="flex-1 p-6 md:p-14 overflow-y-auto bg-gray-100">
           <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6 mt-10">
                <div className="container mx-auto">
                <div className="mb-8">
                  <div className="relative h-48 rounded-lg overflow-hidden mb-20">
                    <div
                      className="absolute top-2 left-1 right-1 bottom-0 rounded-lg bg-gradient-to-r from-teal-700 via-orange-400 to-yellow-300"
                      style={{
                        backgroundImage: `linear-gradient(135deg, #0d6b6b 0%, #0d6b6b 25%, #ff8c42 25%, #ff8c42 50%, #ffc857 50%, #ffc857 75%, #ffd700 75%, #ffd700 100%)`,
                      }}
                    ></div>

                    {/* Upload new cover button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-4 right-4 bg-teal-500 hover:bg-teal-600 text-white border-0 gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload new cover
                    </Button>
                  </div>

                  {/* Centered Avatar */}
                  <div className="flex flex-col items-center -mt-16 mb-8">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full bg-white border-4 border-background flex items-center justify-center shadow-lg">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {/* Lấy 2 chữ cái đầu
                            (ví dụ: user.fullName là 'Xuân Phúc' -> 'XP') */}
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
                      {/* Edit avatar icon */}
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-zinc-300 hover:bg-zinc-400 flex items-center justify-center shadow-lg">
                        <Edit2 className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    {/* User Info */}
                    <h1 className="text-2xl font-bold text-foreground mt-4">{form.fullName}</h1>
                    <p className="text-muted-foreground">{form.email}</p>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-border">
                    <button
                      onClick={() => setActiveTab("account")}
                      className={`flex-1 pb-4 font-medium transition-colors ${
                        activeTab === "account"
                          ? "text-foreground border-b-2 border-teal-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Account
                    </button>
                    <button
                      onClick={() => setActiveTab("booking")}
                      className={`flex-1 pb-4 font-medium transition-colors ${
                        activeTab === "booking"
                          ? "text-foreground border-b-2 border-teal-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Bookings
                    </button>
                    <button
                      onClick={() => setActiveTab("payments")}
                      className={`flex-1 pb-4 font-medium transition-colors ${
                        activeTab === "payments"
                          ? "text-foreground border-b-2 border-teal-500"
                          : "text-muted-foreground hover:text-foreground"
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
                      <h2 className="text-2xl font-bold text-foreground mb-8">Account</h2>

                      <div className="space-y-6">
                        
                        {/* Role Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>                        
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center shrink-0">
                              <IdCard className="w-5 h-5 text-white" />
                            </div>
                            
                            {/* Text */}
                            <div>
                              <p className="text-sm text-muted-foreground">Role</p>
                              <p className="text-lg font-medium text-foreground capitalize">
                                {/* 'capitalize' sẽ tự động đổi 'user' -> 'User' */}
                                {form.role || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Bên phải: Trạng thái Verified */}
                          <div>
                            {form.isActive === 'y' ? (
                              <Badge variant="outline" className="text-green-600 border-green-600 px-3 py-1 text-sm font-medium">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="px-3 py-1 text-sm font-medium">
                                Not Verified
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Name Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Fullname</p>
                            {isEditing ? (
                              <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                className="text-lg font-medium text-foreground outline-none border-b border-teal-500 pb-1"
                                autoFocus
                              />
                            ) : (
                              <p className="text-lg font-medium text-foreground">{form.fullName}</p>
                            )}
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Email</p>
                            {isEditing ? (
                              <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="text-lg font-medium text-foreground outline-none border-b border-teal-500 pb-1 w-full"
                                disabled
                              />
                            ) : (
                              <p className="text-lg font-medium text-foreground">{form.email}</p>
                            )}
                          </div>
                        </div>                      

                        {/* Phone Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Phone number</p>
                            {isEditing ? (
                              <input
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                className="text-lg font-medium text-foreground outline-none border-b border-teal-500 pb-1"
                                autoFocus
                              />
                            ) : (
                              <p className="text-lg font-medium text-foreground">{form.phoneNumber}</p>
                            )}
                          </div>
                        </div>

                        {/* Address Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground mb-1">Address</p>
                            {isEditing ? (
                              <input
                                type="text"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="text-lg font-medium text-foreground outline-none border-b border-teal-500 pb-1 w-full"
                                autoFocus
                              />
                            ) : (
                              <p className="text-lg font-medium text-foreground">{form.address}</p>
                            )}
                          </div>
                        </div>

                        {/* Date of Birth Field */}
                        <div className={`flex items-center justify-between pb-4 ${!isEditing ? "border-b border-border" : ""}`}>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Date of birth</p>
                            {isEditing ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-[240px] justify-start text-left font-medium", 
                                      !form.dateOfBirth && "text-muted-foreground"
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
                              <p className="text-lg font-medium text-foreground">
                                {form.dateOfBirth 
                                ? format(form.dateOfBirth, "dd/MM/yyyy")
                                : "N/A"}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 mt-8">
                        {isEditing ? (
                          <>
                            <Button variant="outline" onClick={handleCancel}>
                              Cancel
                            </Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                          </>
                        ) : (
                          <Button onClick={() => setIsEditing(true)}>Change Information</Button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bookings Tab */}
                  {activeTab === "booking" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Tickets/Bookings</h2>
                        <select className="border border-border rounded-lg px-3 py-2 bg-background text-foreground text-sm">
                          <option>Upcoming</option>
                          <option>Past</option>
                          <option>All</option>
                        </select>
                      </div>

                      {bookings.map((booking) => (
                        <Card
                          key={booking.id}
                          className="p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Ticket className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground">{booking.hotel}</h3>
                              <p className="text-sm text-muted-foreground">
                                {booking.checkIn} - {booking.checkOut}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">Ref: {booking.reference}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-bold text-primary">{booking.price}</p>
                              <p className="text-xs text-muted-foreground">{booking.status}</p>
                            </div>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">View Details</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Payment Methods Tab */}
                  {activeTab === "payments" && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-foreground">Payment methods</h2>
                        <Button onClick={() => setShowAddCard(true)} className="bg-teal-500 hover:bg-teal-600 text-white gap-2">
                          <Plus className="w-4 h-4" />
                          Add a new Card
                        </Button>
                      </div>

                      {/* Saved Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedCards.map((card) => (
                          <Card key={card.id} className="p-6 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                            <div className="flex items-start justify-between mb-12">
                              <div>
                                <p className="text-sm opacity-80">{card.brand}</p>
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
                                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                              >
                                Remove
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>

                      {/* Add Card Modal */}
                      {showAddCard && (
                        <Card className="p-8 border-2 border-primary/20 bg-primary/5">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground">Add a new Card</h3>
                            <button
                              onClick={() => setShowAddCard(false)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4 max-w-md">
                            <div>
                              <label className="text-sm font-medium text-foreground block mb-2">Card Number</label>
                              <input
                                type="text"
                                name="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={newCard.cardNumber}
                                onChange={handleCardChange}
                                className="w-full border border-border rounded-lg px-3 py-2 outline-none bg-background text-foreground"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium text-foreground block mb-2">Expiry Date</label>
                                <input
                                  type="text"
                                  name="expiryDate"
                                  placeholder="MM/YY"
                                  value={newCard.expiryDate}
                                  onChange={handleCardChange}
                                  className="w-full border border-border rounded-lg px-3 py-2 outline-none bg-background text-foreground"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-foreground block mb-2">CVV</label>
                                <input
                                  type="text"
                                  name="cvv"
                                  placeholder="123"
                                  value={newCard.cvv}
                                  onChange={handleCardChange}
                                  className="w-full border border-border rounded-lg px-3 py-2 outline-none bg-background text-foreground"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-sm font-medium text-foreground block mb-2">Cardholder Name</label>
                              <input
                                type="text"
                                name="cardholderName"
                                placeholder="John Doe"
                                value={newCard.cardholderName}
                                onChange={handleCardChange}
                                className="w-full border border-border rounded-lg px-3 py-2 outline-none bg-background text-foreground"
                              />
                            </div>

                            <Button
                              onClick={handleAddCard}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
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
  );
}

