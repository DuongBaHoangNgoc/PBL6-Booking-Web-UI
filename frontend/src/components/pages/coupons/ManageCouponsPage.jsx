import { useState, useEffect, useCallback } from "react";
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Calendar,
    Tag,
    Percent,
    Loader2,
    MoreHorizontal,
    X,
    Info,
    AlertTriangle,
    Power,
    PowerOff,
    Filter
} from "lucide-react";
import { format, isBefore, isValid, startOfDay } from "date-fns";
import { CheckCircle2 } from "lucide-react";
import { getCouponsPagination, updateCoupon, deleteCoupon, createCoupon } from "@/api/coupons";
import { Label } from "@radix-ui/react-label";
import { useToast } from "@/hooks/use-toast";
/**
 * UI COMPONENTS (INLINED)
 */
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const CardContent = ({ children, className = "" }) => (
    <div className={className}>{children}</div>
);

const Button = ({ children, onClick, className = "", variant = "primary", disabled = false, size = "md" }) => {
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-800 shadow-sm",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
        destructive: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
    };
    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-lg font-semibold transition-all disabled:opacity-50 active:scale-[0.98] ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, className = "" }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ring-1 ring-inset ${className}`}>{children}</span>
);

const Input = ({ className = "", icon: Icon = null, ...props }) => (
    <div className="relative w-full">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />}
        <input className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white ${className}`} {...props} />
    </div>
);

const Select = ({ value, onChange, options, icon: Icon = null, className = "" }) => (
    <div className="relative w-full md:w-48">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />}
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white appearance-none cursor-pointer ${className}`}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
    </div>
);

export function ManageCouponsPage() {
    const { toast } = useToast();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [errors, setErrors] = useState({
        title: "",
        codeCoupon: "",
        discount: 0,
        startDate: "",
        endDate: "",
    });

    const [filters, setFilters] = useState({ code: "", status: "all" });

    // Form State map với API
    const [formData, setFormData] = useState({
        title: "",
        codeCoupon: "",
        discount: 0,
        startDate: "",
        endDate: "",
    });

    const fetchCoupons = useCallback(async () => {
        setLoading(true);
        const data = await getCouponsPagination();
        setCoupons(data.items);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const validateForm = () => {
        const newErrors = {};
        const today = startOfDay(new Date());

        if (!formData.title.trim()) newErrors.title = "Tiêu đề không được để trống";
        if (!formData.codeCoupon.trim()) newErrors.codeCoupon = "Mã coupon không được để trống";
        if (!formData.discount || formData.discount <= 0) newErrors.discount = "Giá trị giảm phải lớn hơn 0";

        // Validate ngày tháng
        if (!formData.startDate) {
            newErrors.startDate = "Vui lòng chọn ngày bắt đầu";
        } else {
            const start = new Date(formData.startDate);

            if (isBefore(startOfDay(start), today)) {
                newErrors.startDate = "Ngày bắt đầu không được ở quá khứ";
            }
        }

        if (!formData.endDate) {
            newErrors.endDate = "Vui lòng chọn ngày kết thúc";
        } else {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);

            if (isBefore(end, today)) {
                newErrors.endDate = "Ngày kết thúc không được ở quá khứ";
            }

            // Case: Ngày kết thúc trước ngày bắt đầu
            if (formData.startDate && isBefore(startOfDay(end), startOfDay(start))) {
                newErrors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setEditingCoupon(coupon);
            setFormData({
                title: coupon.title,
                codeCoupon: coupon.codeCoupon,
                discount: coupon.discount,
                startDate: coupon.startDate ? format(new Date(coupon.startDate), "yyyy-MM-dd") : "",
                endDate: coupon.endDate ? format(new Date(coupon.endDate), "yyyy-MM-dd") : "",
            });
        } else {
            setEditingCoupon(null);
            setFormData({
                title: "",
                codeCoupon: "",
                discount: 0,
                startDate: "",
                endDate: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        try {
            if (editingCoupon) {
                await updateCoupon(editingCoupon.couponId, formData);
                toast({
                    title: "✅ Cập nhật thành công",
                    description: "Mã giảm giá đã được áp dụng.",
                })
            } else {
                await createCoupon(formData);
                alert("✅ Tạo mã giảm giá thành công!");
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (err) {
            console.error("Lỗi khi lưu:", err);
            alert("Lỗi khi lưu mã giảm giá.");
        }
    };

    const handleDelete = async () => {
        if (!editingCoupon) return;

        const targetId = editingCoupon.couponId || editingCoupon.id;

        if (!targetId) {
            console.error("❌ Không tìm thấy couponId trong đối tượng:", editingCoupon);
            alert("Lỗi: Không tìm thấy định danh của mã giảm giá.");
            return;
        }

        try {
            console.log("🛠 Đang gửi yêu cầu xóa cho ID:", targetId);
            await deleteCoupon(targetId);

            setIsDeleteOpen(false);
            fetchCoupons();
            alert("✅ Đã xóa mã giảm giá thành công.");
        } catch (err) {
            console.error("❌ Lỗi thực thi xóa:", err);
            alert("Lỗi khi xóa mã.");
        }
    };

    // Logic tính toán trạng thái hiển thị dựa trên ngày
    const getStatusInfo = (coupon) => {
        if (coupon.status === 'n') {
            return {
                label: "INACTIVE",
                class: "bg-red-50 text-red-600 ring-red-600/20"
            };
        }

        if (!coupon.endDate) return { label: "ACTIVE", class: "bg-green-50 text-green-700 ring-green-600/20" };

        const today = startOfDay(new Date());
        const end = startOfDay(new Date(coupon.endDate));

        if (isValid(end) && isBefore(end, today)) {
            return {
                label: "EXPIRED",
                class: "bg-slate-100 text-slate-500 ring-slate-500/20"
            };
        }

        return {
            label: "ACTIVE",
            class: "bg-green-50 text-green-700 ring-green-600/20"
        };
    };

    const filteredCoupons = coupons.filter(c => {
        const matchesSearch = (c.codeCoupon || "").toLowerCase().includes(filters.code.toLowerCase()) ||
            (c.title || "").toLowerCase().includes(filters.code.toLowerCase());

        const info = getStatusInfo(c);
        const matchesStatus = filters.status === "all" || info.label === filters.status;

        return matchesSearch && matchesStatus;
    }
    );

    const handleToggleStatus = async (coupon) => {
        const newStatus = coupon.status === 'y' ? 'n' : 'y';
        try {
            await updateCoupon(coupon.couponId, { status: newStatus });
            alert(`✅ Đã ${newStatus === 'y' ? 'Kích hoạt' : 'Tạm dừng'} mã giảm giá.`);
            fetchCoupons();
        } catch (err) {
            alert("❌ Lỗi khi đổi trạng thái.");
        }
    };


    return (
        <section className="min-h-screen my-10 pb-16 font-sans text-slate-900">
            <div className="container mx-auto max-w-6xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Quản lý Khuyến mãi</h1>
                        <p className="text-slate-500 text-sm mt-1">Thiết lập và theo dõi các chương trình giảm giá cho Tour.</p>
                    </div>

                    <Button onClick={() => handleOpenModal()} className="gap-2" variant="primary">
                        <Plus className="w-4 h-4" /> Tạo mã mới
                    </Button>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Đang hoạt động</p>
                            <span className="text-2xl font-bold">{coupons.filter(c => getStatusInfo(c.endDate).label === 'ACTIVE').length}</span>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Percent className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Mức giảm trung bình</p>
                            <span className="text-2xl font-bold">12%</span>
                        </div>
                    </Card>
                    <Card className="p-5 flex items-center gap-4">
                        <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Đã hết hạn</p>
                            <span className="text-2xl font-bold text-slate-400">{coupons.filter(c => getStatusInfo(c).label === 'EXPIRED').length}</span>
                        </div>
                    </Card>
                </div>

                {/* Filter Card */}
                <Card className="mb-8 rounded-2xl overflow-hidden bg-white/80">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                            {/* Ô tìm kiếm chiếm 5 cột */}
                            <div className="md:col-span-5 space-y-2.5">
                                <Label htmlFor="status" className="text-sm font-medium text-slate-600 ml-1">Tìm kiếm</Label>

                                <div className="relative group">
                                    <Input
                                        id="search"
                                        value={filters.code}
                                        onChange={(e) => setFilters({ ...filters, code: e.target.value })}
                                        className="pl-10 h-11 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-400 transition-all bg-slate-50/50 hover:bg-white"
                                    />
                                </div>
                            </div>

                            {/* Trạng thái chiếm 4 cột */}
                            <div className="md:col-span-4 space-y-2.5">
                                <Label htmlFor="status" className="text-sm font-medium text-slate-600 ml-1">Trạng thái hệ thống</Label>
                                <Select
                                    value={filters.status}
                                    onChange={(val) => setFilters({ ...filters, status: val })}
                                    options={[
                                        { label: "Tất cả trạng thái", value: "all" },
                                        { label: "● Đang hoạt động", value: "ACTIVE" },
                                        { label: "○ Đã tạm dừng", value: "INACTIVE" },
                                        { label: "✕ Đã hết hạn", value: "EXPIRED" },
                                    ]}
                                    className="h-11 border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 bg-slate-50/50"
                                />
                            </div>

                            {/* Nút bấm chiếm 3 cột */}
                            <div className="md:col-span-3 flex gap-2">
                                <Button
                                    className="flex-1 h-11 border-slate-200 rounded-xl font-semibol hover:bg-rose-50 transition-all"
                                    onClick={() => setFilters({ code: "", status: "all" })}
                                >
                                    Làm mới
                                </Button>

                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Table Card */}
                <Card className="p-6 overflow-hidden" >
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-4 px-4 font-semibold text-left">Mã Khuyến mãi</th>
                                    <th className="py-4 px-4 font-semibold text-left">Giá trị (%)</th>
                                    <th className="py-4 px-4 font-semibold text-left">Ngày bắt đầu</th>
                                    <th className="py-4 px-4 font-semibold text-left">Ngày kết thúc</th>
                                    <th className="py-4 px-4 font-semibold text-left">Trạng thái</th>
                                    <th className="py-4 px-4 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></td></tr>
                                ) : filteredCoupons.length === 0 ? (
                                    <tr><td colSpan={6} className="py-20 text-center text-slate-400 italic">Không có dữ liệu mã giảm giá.</td></tr>
                                ) : filteredCoupons.map((coupon) => {
                                    const status = getStatusInfo(coupon);
                                    return (
                                        <tr key={coupon.couponId} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900">{coupon.title}</span>
                                                    <span className="text-xs text-blue-600 font-mono flex items-center gap-1">
                                                        <Tag className="w-3 h-3" /> {coupon.codeCoupon}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="font-black text-slate-700 text-lg">{coupon.discount}%</span>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 font-medium">
                                                {format(new Date(coupon.startDate), "dd/MM/yyyy")}
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 font-medium">
                                                {format(new Date(coupon.endDate), "dd/MM/yyyy")}
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <Badge className={status.class}>{status.label}</Badge>
                                            </td>
                                            <td className="py-6 px-8 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {/* NÚT TOGGLE TRẠNG THÁI MỚI */}
                                                    <button
                                                        onClick={() => handleToggleStatus(coupon)}
                                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${coupon.status === 'y' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                                                        title={coupon.status === 'y' ? 'Tạm dừng mã' : 'Kích hoạt mã'}
                                                    >
                                                        {coupon.status === 'y' ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                                    </button>

                                                    <div className="relative inline-block text-left group/drop">
                                                        <button className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-200 transition-colors text-slate-500"><MoreHorizontal className="h-5 w-5" /></button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white border-slate-100 rounded-[1.5rem] shadow-2xl opacity-0 invisible group-hover/drop:opacity-100 group-hover/drop:visible z-20 transition-all transform origin-top-right border-slate-100 overflow-hidden">
                                                            <div className="p-2">
                                                                <button onClick={() => handleOpenModal(coupon)} className="flex items-center w-full gap-3 px-4 py-3 text-xs font-black text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"><Edit className="w-4 h-4" /> CHỈNH SỬA</button>
                                                                <button onClick={() => { setEditingCoupon(coupon); setIsDeleteOpen(true); }} className="flex items-center w-full gap-3 px-4 py-3 text-xs font-black text-red-600 hover:bg-red-50 rounded-xl transition-all mt-1"><Trash2 className="w-4 h-4" /> XÓA VĨNH VIỄN</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card >
            </div >

            {/* MODAL THÊM / SỬA (Map với formData mới) */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-900">
                                    {editingCoupon ? "Cập nhật khuyến mãi" : "Tạo khuyến mãi mới"}
                                </h2>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Info className="w-3 h-3" /> Tên chương trình
                                    </label>
                                    <Input
                                        placeholder="Vd: Ưu đãi mùa du lịch tháng 12"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                    {errors.title && <p className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {errors.title}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Tag className="w-3 h-3" /> Mã Coupon
                                    </label>
                                    <Input
                                        className="font-mono font-bold text-base uppercase"
                                        placeholder="Vd: WINTER24"
                                        value={formData.codeCoupon}
                                        onChange={(e) => setFormData({ ...formData, codeCoupon: e.target.value.toUpperCase() })}
                                    />
                                    {errors.codeCoupon && <p className="text-[10px] text-red-500 font-bold">{errors.codeCoupon}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Percent className="w-3 h-3" /> Giá trị giảm (%)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Vd: 10"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                    />
                                    {errors.discount && <p className="text-[10px] text-red-500 font-bold">{errors.discount}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày bắt đầu</label>
                                        <Input
                                            type="date"
                                            value={formData.startDate}
                                            error={errors.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        />
                                        {errors.startDate && <p className="text-[10px] text-red-500 font-black leading-tight italic mt-1">{errors.startDate}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày kết thúc</label>
                                        <Input
                                            type="date"
                                            value={formData.endDate}
                                            error={errors.endDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        />
                                        {errors.endDate && <p className="text-[10px] text-red-500 font-black leading-tight italic mt-1">{errors.endDate}</p>}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                                <Button onClick={handleSave} className="px-8">
                                    {editingCoupon ? "Lưu thay đổi" : "Kích hoạt ngay"}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* DIALOG XÁC NHẬN XÓA */}
            {
                isDeleteOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-sm rounded-2xl p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Xác nhận xóa mã?</h2>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">
                                Mã <strong>{editingCoupon?.codeCoupon}</strong> sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Button onClick={handleDelete} variant="destructive" className="w-full py-2.5">Xóa vĩnh viễn</Button>
                                <Button variant="ghost" onClick={() => setIsDeleteOpen(false)} className="w-full">Quay lại</Button>
                            </div>
                        </div>
                    </div>
                )
            }

        </section >
    );
}
