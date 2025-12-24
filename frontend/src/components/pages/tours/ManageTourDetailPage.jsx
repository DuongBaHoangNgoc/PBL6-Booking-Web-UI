import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  PlusCircle,
  Edit,
  Trash2,
  ChevronsUpDown,
  X,
  Check,
} from "lucide-react";
import {
  getTourById,
  getTimelineByTourId,
  getStartDatesByTourId,
  updateTour,
  createTimeline,
  updateTimeline,
  deleteTimeline,
  createStartDate,
  updateStartDate,
  createImages,
  deleteImage,
  getImagesByTourId,
  updateStartEndDateStatus, // ✅ PATCH updateStatus/:id?status=
} from "@/api/tours";

import {
  getHashtagsForTour,
  filterHashtags,
  createHashtag,
  linkTourToHashTag,
  deleteTourHashtag,
} from "@/api/hashtags";

import { format } from "date-fns";
import slugify from "slugify";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/useAuth";

// ✅ IMPORT CANCEL API (đổi path theo dự án bạn)
import { supplierCancelBooking } from "@/api/bookings";

// ================= Helpers =================
const formatHashtag = (text) => {
  const cleaned = text.replace(/#/g, "").trim();
  if (!cleaned) return null;
  const slug = slugify(cleaned, { lower: true, strict: true, locale: "vi" });
  const formatted = slug.replace(/-/g, "");
  return `#${formatted}`;
};

const todayISO = () => {
  const now = new Date();
  // lấy ngày theo local timezone (đúng với input date)
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toISODateInput = (date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const addDaysISO = (startISO, daysToAdd) => {
  if (!startISO) return "";
  const d = new Date(startISO);
  if (Number.isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + Number(daysToAdd || 0));
  return toISODateInput(d);
};

const parseDaysFromTime = (timeStr) => {
  const m = String(timeStr || "").match(/(\d+)\s*ngày/i);
  return m?.[1] ? Number(m[1]) : 3; // default 3 nếu không parse được
};

// ================= EditTourInfo =================
function EditTourInfo({ tour, onTourUpdated }) {
  const [formData, setFormData] = useState(tour);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { tourId, ...updateData } = formData;
      const updated = await updateTour(tourId, updateData);
      onTourUpdated(updated);
      alert("Cập nhật thông tin tour thành công!");
    } catch (err) {
      alert("Lỗi khi cập nhật thông tin tour.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cơ bản</CardTitle>
        <CardDescription>
          Cập nhật thông tin chung, mô tả, và ảnh bìa của tour.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Tên Tour</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="destination">Điểm đến</Label>
            <Input
              id="destination"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="highlight">Tour highlight</Label>
            <Textarea
              id="highlight"
              name="highlight"
              value={formData.highlight || ""}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Lưu Thông tin Cơ bản
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// ================= Timeline dialogs =================
function AddTimelineForm({ tourId, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    tl_title: "",
    tl_description: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("tourId", tourId);
      apiFormData.append("tl_title", formData.tl_title);
      apiFormData.append("tl_description", formData.tl_description);
      if (file) apiFormData.append("file", file);

      await createTimeline(apiFormData);
      alert("Thêm lịch trình thành công!");
      onSuccess();
    } catch (err) {
      alert("Lỗi khi thêm lịch trình.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Lịch trình</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tl_title">Tiêu đề</Label>
            <Input
              id="tl_title"
              name="tl_title"
              value={formData.tl_title}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="tl_description">Mô tả (Hỗ trợ HTML)</Label>
            <Textarea
              id="tl_description"
              name="tl_description"
              value={formData.tl_description}
              onChange={handleChange}
              rows={10}
            />
          </div>
          <div>
            <Label htmlFor="images_upload">Chọn ảnh</Label>
            <Input
              id="images_upload"
              type="file"
              onChange={handleFileChange}
              required
            />
          </div>

          {file && (
            <div className="text-sm text-muted-foreground">
              Đã chọn: {file.name}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTimelineForm({ timeline, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    tl_title: "",
    tl_description: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timeline) {
      setFormData({
        tl_title: timeline.tl_title,
        tl_description: timeline.tl_description,
      });
    }
  }, [timeline]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!timeline) return;

    setLoading(true);
    try {
      await updateTimeline(timeline.timeLineId, formData);
      alert("Cập nhật lịch trình thành công!");
      onSuccess();
    } catch (err) {
      alert("Lỗi khi cập nhật lịch trình.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Lịch trình</DialogTitle>
          <DialogDescription>
            Bạn đang chỉnh sửa: {timeline?.tl_title}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="tl_title_edit">Tiêu đề</Label>
            <Input
              id="tl_title_edit"
              name="tl_title"
              value={formData.tl_title}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="tl_description_edit">Mô tả (Hỗ trợ HTML)</Label>
            <Textarea
              id="tl_description_edit"
              name="tl_description"
              value={formData.tl_description}
              onChange={handleChange}
              rows={10}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTimelines({ tourId, timelines, onTimelinesUpdated }) {
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (timelineId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa mục lịch trình này?")) return;
    try {
      await deleteTimeline(timelineId);
      onTimelinesUpdated();
    } catch (err) {
      alert("Lỗi khi xóa timeline.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Lịch trình (Timelines)</CardTitle>
          <Button size="sm" className="mt-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm mục Lịch trình
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề (Ngày)</TableHead>
                <TableHead>Mô tả (ngắn)</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timelines.map((item) => (
                <TableRow key={item.timeLineId}>
                  <TableCell className="font-medium">{item.tl_title}</TableCell>
                  <TableCell className="truncate max-w-xs">
                    {item.tl_description.substring(0, 100)}...
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTimeline(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(item.timeLineId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddTimelineForm
        tourId={tourId}
        open={isAddOpen}
        onOpenChange={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          onTimelinesUpdated();
        }}
      />

      <EditTimelineForm
        timeline={editingTimeline}
        open={!!editingTimeline}
        onOpenChange={() => setEditingTimeline(null)}
        onSuccess={() => {
          setEditingTimeline(null);
          onTimelinesUpdated();
        }}
      />
    </>
  );
}

// ================= StartDate dialogs =================
function AddStartDateForm({ tourId, tourTime, open, onOpenChange, onSuccess }) {
  const totalDays = Math.max(1, parseDaysFromTime(tourTime)); // ví dụ "3 ngày 2 đêm" => 3
  const minStartDate = useMemo(() => todayISO(), []);

  const [formData, setFormData] = useState({
    tourId,
    startDate: "",
    endDate: "",
    priceAdult: 1000000,
    priceChildren: 500000,
    quantity: 10,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // ✅ giống Step4: chọn startDate -> tự tính endDate
      if (name === "startDate") {
        // NOTE: Thông thường "3 ngày 2 đêm" => end = start + 2
        // Nếu muốn chuẩn logic tour: dùng totalDays - 1
        next.endDate = addDaysISO(value, totalDays - 1);
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        tourId,
        priceAdult: Number(formData.priceAdult),
        priceChildren: Number(formData.priceChildren),
        quantity: Number(formData.quantity),
        availability: 1,
        status: "active", // ✅ nếu backend có field status
      };

      await createStartDate(payload);
      alert("Thêm ngày khởi hành thành công!");
      onSuccess();
    } catch (err) {
      alert("Lỗi khi thêm ngày khởi hành.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Thêm Ngày khởi hành & Giá vé</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate_add">Ngày đi</Label>
              <Input
                id="startDate_add"
                name="startDate"
                type="date"
                value={formData.startDate}
                min={minStartDate}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate_add">Ngày về (tự động)</Label>
              <Input
                id="endDate_add"
                name="endDate"
                type="date"
                value={formData.endDate}
                readOnly
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceAdult_add">Giá Người lớn (VNĐ)</Label>
              <Input
                id="priceAdult_add"
                name="priceAdult"
                type="number"
                min="1"
                value={formData.priceAdult}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="priceChildren_add">Giá Trẻ em (VNĐ)</Label>
              <Input
                id="priceChildren_add"
                name="priceChildren"
                type="number"
                min="0"
                value={formData.priceChildren}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="quantity_add">Số chỗ</Label>
              <Input
                id="quantity_add"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditStartDateForm({
  tourId,
  startDate,
  open,
  onOpenChange,
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    priceAdult: 0,
    priceChildren: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(false);

  const formatDateForInput = (isoDate) => {
    if (!isoDate) return "";
    return format(new Date(isoDate), "yyyy-MM-dd");
  };

  useEffect(() => {
    if (startDate) {
      setFormData({
        startDate: formatDateForInput(startDate.startDate),
        endDate: formatDateForInput(startDate.endDate),
        priceAdult: startDate.priceAdult,
        priceChildren: startDate.priceChildren,
        quantity: startDate.quantity,
        tourId: tourId,
      });
    }
  }, [startDate, tourId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        priceAdult: Number(formData.priceAdult),
        priceChildren: Number(formData.priceChildren),
        quantity: Number(formData.quantity),
        tourId: formData.tourId,
      };
      await updateStartDate(startDate.dateId, payload);
      alert("Cập nhật ngày khởi hành thành công!");
      onSuccess();
    } catch (err) {
      alert("Lỗi khi cập nhật ngày khởi hành.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa Ngày khởi hành</DialogTitle>
          <DialogDescription>
            Bạn đang chỉnh sửa ngày: {formData.startDate}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate_edit">Ngày đi</Label>
              <Input
                id="startDate_edit"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate_edit">Ngày về</Label>
              <Input
                id="endDate_edit"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceAdult_edit">Giá Người lớn (VNĐ)</Label>
              <Input
                id="priceAdult_edit"
                name="priceAdult"
                type="number"
                value={formData.priceAdult}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="priceChildren_edit">Giá Trẻ em (VNĐ)</Label>
              <Input
                id="priceChildren_edit"
                name="priceChildren"
                type="number"
                value={formData.priceChildren}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity_edit">Số chỗ</Label>
              <Input
                id="quantity_edit"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ================= EditStartDates (CHANGED) =================
function EditStartDates({ tourId, tourTime, startDates, onStartDatesUpdated }) {
  const [editingStartDate, setEditingStartDate] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // ✅ chỉ render active
  const activeStartDates = (startDates || []).filter(
    (d) => String(d.status || "active").toLowerCase() === "active"
  );

  const handleDelete = async (dateId) => {
    const safeId = Number(dateId);

    if (!Number.isFinite(safeId) || safeId <= 0) {
      console.error("Invalid dateId:", dateId);
      alert("dateId không hợp lệ. Vui lòng reload trang và thử lại.");
      return;
    }

    if (
      !window.confirm(
        "Bạn chắc chắn muốn xóa ngày khởi hành này?\nHệ thống sẽ hoàn tiền cho user đã đặt tour."
      )
    )
      return;

    try {
      setDeletingId(safeId);

      const cancelRes = await supplierCancelBooking(safeId);
      if (!cancelRes?.message)
        throw new Error("SupplierCancelBooking thất bại");

      const upRes = await updateStartEndDateStatus(safeId, "inactive");
      if (upRes?.statusCode && upRes.statusCode !== 200) {
        throw new Error(upRes?.message || "Update status thất bại");
      }

      await onStartDatesUpdated?.();
      alert("✅ Đã hoàn tiền & chuyển trạng thái inactive.");
    } catch (err) {
      console.error("❌ RAW ERR:", err);
      console.error("❌ message:", err?.message);
      console.error("❌ stack:", err?.stack);
      console.error("❌ axios?", {
        url: err?.config?.url,
        method: err?.config?.method,
        status: err?.response?.status,
        data: err?.response?.data,
      });

      alert(
        err?.response?.data?.message || err?.message || "❌ Thao tác thất bại"
      );
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Ngày khởi hành & Giá vé</CardTitle>
          <Button size="sm" className="mt-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm Ngày/Giá
          </Button>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ngày đi</TableHead>
                <TableHead>Ngày về</TableHead>
                <TableHead>Giá Người lớn</TableHead>
                <TableHead>Giá Trẻ em</TableHead>
                <TableHead>Số chỗ</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {activeStartDates.map((item) => {
                const rowId = Number(item.dateId);

                return (
                  <TableRow key={String(item.dateId)}>
                    <TableCell>
                      {item.startDate
                        ? format(new Date(item.startDate), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {item.endDate
                        ? format(new Date(item.endDate), "dd/MM/yyyy")
                        : "-"}
                    </TableCell>

                    <TableCell>
                      {Number(item.priceAdult || 0).toLocaleString("vi-VN")}₫
                    </TableCell>

                    <TableCell>
                      {Number(item.priceChildren || 0).toLocaleString("vi-VN")}₫
                    </TableCell>

                    <TableCell>{item.quantity ?? "-"}</TableCell>

                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingStartDate(item)}
                        disabled={deletingId === rowId}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600"
                        onClick={() => handleDelete(rowId)}
                        disabled={deletingId === rowId}
                        title="Hoàn tiền + chuyển inactive"
                      >
                        {deletingId === rowId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}

              {activeStartDates.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground py-6"
                  >
                    Không có ngày khởi hành nào (active).
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddStartDateForm
        tourId={tourId}
        tourTime={tourTime}
        open={isAddOpen}
        onOpenChange={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          onStartDatesUpdated();
        }}
      />

      <EditStartDateForm
        tourId={tourId}
        startDate={editingStartDate}
        open={!!editingStartDate}
        onOpenChange={() => setEditingStartDate(null)}
        onSuccess={() => {
          setEditingStartDate(null);
          onStartDatesUpdated();
        }}
      />
    </>
  );
}

// ================= Images =================
function AddImagesForm({ tourId, open, onOpenChange, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Vui lòng chọn ít nhất một ảnh.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tourId", tourId);
      for (const file of files) formData.append("files", file);

      await createImages(formData);
      alert("Thêm ảnh thành công!");
      onSuccess();
    } catch (err) {
      alert("Lỗi khi tải ảnh lên.");
    } finally {
      setLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Ảnh Gallery</DialogTitle>
          <DialogDescription>
            Bạn có thể chọn và tải lên nhiều ảnh cùng lúc.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="images_upload">Chọn ảnh</Label>
            <Input
              id="images_upload"
              type="file"
              onChange={handleFileChange}
              multiple
              required
            />
          </div>

          {files.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn: {files.map((f) => f.name).join(", ")}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tải lên
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTourImages({ tourId, images, onImagesUpdated }) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = async (imageId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ảnh này?")) return;
    try {
      await deleteImage(imageId);
      onImagesUpdated();
    } catch (err) {
      alert("Lỗi khi xóa ảnh.");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý Ảnh Gallery</CardTitle>
          <CardDescription>
            Thêm hoặc xóa các ảnh hiển thị trong gallery của tour.
          </CardDescription>
          <Button size="sm" className="mt-2" onClick={() => setIsAddOpen(true)}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm Ảnh
          </Button>
        </CardHeader>

        <CardContent>
          {!Array.isArray(images) || images.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tour này chưa có ảnh gallery.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.imageId}
                  className="relative group border rounded-lg overflow-hidden"
                >
                  <img
                    src={img.image || img.imageURL || img.url || ""}
                    alt={img.caption || "Tour Gallery"}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute top-1 right-1">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDelete(img.imageId)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddImagesForm
        tourId={tourId}
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={() => {
          setIsAddOpen(false);
          onImagesUpdated();
        }}
      />
    </>
  );
}

// ================= Hashtags =================
function EditTourHashtags({ tourId, linkedHashtags, onHashtagsUpdated }) {
  const safeLinkedHashtags = linkedHashtags || [];
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      const formattedQuery = formatHashtag(searchQuery);
      const params = {
        hashtag: formattedQuery || undefined,
        limit: 20,
        page: 1,
      };
      const tags = await filterHashtags(params);
      setAvailableHashtags(tags?.hashtags || []);
      setLoading(false);
    };

    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (tourHashTagId) => {
    if (!window.confirm("Bạn chắc chắn muốn gỡ hashtag này khỏi tour?")) return;
    try {
      await deleteTourHashtag(tourHashTagId);
      onHashtagsUpdated();
    } catch (err) {
      alert("Lỗi khi gỡ hashtag.");
    }
  };

  const handleSelect = async (tag) => {
    if (
      safeLinkedHashtags.find(
        (item) => item.hashtag.hashtagId === tag.hashtagId
      )
    ) {
      setSearchQuery("");
      setOpen(false);
      return;
    }

    try {
      await linkTourToHashTag({ tourId, hashtagId: tag.hashtagId });
      onHashtagsUpdated();
    } catch (err) {
      alert("Lỗi khi gắn hashtag.");
    } finally {
      setSearchQuery("");
      setOpen(false);
    }
  };

  const handleCreate = async () => {
    const formattedName = formatHashtag(searchQuery);
    if (!formattedName) return;

    const existing = availableHashtags.find((t) => t.name === formattedName);
    if (existing) {
      handleSelect(existing);
      return;
    }

    setLoading(true);
    try {
      const newTag = await createHashtag({
        name: formattedName,
        description: searchQuery,
      });
      await handleSelect(newTag);
    } catch (err) {
      alert("Lỗi khi tạo tag mới.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCreate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý Hashtags</CardTitle>
        <CardDescription>
          Gắn các hashtag liên quan. Gõ để tìm kiếm hoặc tạo mới.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              Tìm hoặc tạo hashtag...
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
            <Command>
              <CommandInput
                placeholder="Gõ tag (ví dụ: Đà Nẵng) rồi Enter..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onKeyDown={handleKeyDown}
              />
              <CommandList>
                {loading && <CommandItem disabled>Đang tải...</CommandItem>}
                <CommandEmpty>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCreate}
                    className="w-full"
                  >
                    Tạo mới tag: "{formatHashtag(searchQuery) || searchQuery}"
                  </Button>
                </CommandEmpty>
                <CommandGroup>
                  {availableHashtags?.map((tag) => (
                    <CommandItem
                      key={tag.hashtagId}
                      value={tag.name}
                      onSelect={() => handleSelect(tag)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          safeLinkedHashtags.some(
                            (item) => item.hashtag.hashtagId === tag.hashtagId
                          )
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {tag.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <div className="space-y-2">
          <Label>Các tag đã gắn:</Label>
          <div className="flex flex-wrap gap-2">
            {safeLinkedHashtags.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có tag nào.</p>
            )}
            {safeLinkedHashtags.map((item) => (
              <Badge
                key={item.tourHashTagId}
                variant="secondary"
                className="pl-2 pr-1"
              >
                {item.hashtag.name}
                <button
                  onClick={() => handleDelete(item.tourHashTagId)}
                  className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ================= Page =================
export function ManageTourDetailPage() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [tour, setTour] = useState(null);
  const [timelines, setTimelines] = useState([]);
  const [startDates, setStartDates] = useState([]);
  const [images, setImages] = useState([]);
  const [hashtags, setHashtags] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tourData, timelineData, startDatesData, imagesData, hashtagData] =
        await Promise.all([
          getTourById(id),
          getTimelineByTourId(id),
          getStartDatesByTourId(id),
          getImagesByTourId(id),
          getHashtagsForTour(id),
        ]);

      setTour(tourData);
      setTimelines(timelineData || []);
      setStartDates(startDatesData || []);
      setImages(imagesData || []);
      setHashtags(hashtagData || {});
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tour chi tiết:", err);
      setError("Không thể tải dữ liệu tour.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchImages = async () => {
    try {
      const imagesData = await getImagesByTourId(id);
      setImages(imagesData || []);
    } catch (err) {
      console.error("Lỗi tải ảnh:", err);
      setError("Không thể tải ảnh gallery.");
    }
  };

  const fetchHashtags = async () => {
    try {
      const hashtagData = await getHashtagsForTour(id);
      setHashtags(hashtagData || {});
    } catch (err) {
      console.error("Lỗi tải hashtags:", err);
      setError("Không thể tải hashtags.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        Đang tải dữ liệu tour...
      </div>
    );

  if (error || !tour)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        <AlertCircle className="w-8 h-8 mr-2" />
        {error || "Không tìm thấy tour."}
      </div>
    );

  return (
    <div className="p-6 md:p-14 space-y-8 bg-white rounded-lg shadow-md">
      <Button
        variant="outline"
        onClick={
          user.role === "admin"
            ? () => navigate("/admin/tours")
            : () => navigate("/supplier/tours")
        }
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>

      <h1 className="text-3xl font-bold text-foreground">
        Chỉnh sửa Tour: <span className="text-primary">{tour.title}</span>
      </h1>

      <EditTourInfo tour={tour} onTourUpdated={(u) => setTour(u)} />

      <EditTourImages
        tourId={tour.tourId}
        images={images}
        onImagesUpdated={fetchImages}
      />

      <EditTourHashtags
        tourId={tour.tourId}
        linkedHashtags={hashtags?.tourHashtags}
        onHashtagsUpdated={fetchHashtags}
      />

      <EditTimelines
        tourId={tour.tourId}
        timelines={timelines}
        onTimelinesUpdated={fetchData}
      />

      <EditStartDates
        tourId={tour.tourId}
        tourTime={tour.time} // ✅ FIX: lấy từ tour (không phải tourId.time)
        startDates={startDates}
        onStartDatesUpdated={fetchData}
      />
    </div>
  );
}
