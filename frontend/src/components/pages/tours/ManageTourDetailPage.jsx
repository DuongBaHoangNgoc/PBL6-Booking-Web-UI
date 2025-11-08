import { useState, useEffect } from "react";
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
  Save,
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
  deleteStartDate,
  // functions for image management
  createImages,
  deleteImage,
  getImagesByTourId,
} from "@/api/tours";
import { getHashtagsForTour, filterHashtags, createHashtag, linkTourToHashTag, deleteTourHashtag } from "@/api/hashtags";
import { format, set } from "date-fns";
import slugify from "slugify";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
 } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ta } from "date-fns/locale";

// (Hàm formatHashtag - nên để ở file hashtag.js, nhưng để đây cho component dùng)
const formatHashtag = (text) => {
  const cleaned = text.replace(/#/g, "").trim();
  if (!cleaned) return null;
  const slug = slugify(cleaned, { lower: true, strict: true, locale: 'vi' });
  const formatted = slug.replace(/-/g, '');
  return `#${formatted}`;
};

// --- Component Form Sửa Tour Cơ Bản ---
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
      onTourUpdated(updated); // Cập nhật lại state ở trang cha
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
          {/* (Thêm các trường khác: title, destination, time, quantity...) */}
          <div className="space-y-2">
            <Label htmlFor="title">Tên Tour</Label>
            <Input id="title" name="title" value={formData.title} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Điểm đến</Label>
            <Input id="destination" name="destination" value={formData.destination} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết</Label>
            <Textarea id="description" name="description" value={formData.description || ""} onChange={handleChange} />
          </div>
          <div className="space-y-4">
            <Label htmlFor="highlight">Tour highlight</Label>
            <Textarea id="highlight" name="highlight" value={formData.highlight || ""} onChange={handleChange} />
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

// Dialog Add Timeline
function AddTimelineForm({ tourId, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({tl_title: '', tl_description: ''});
  const [file, setFile] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]); // Get 1 file
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("tourId", tourId);
      apiFormData.append("tl_title", formData.tl_title);
      apiFormData.append("tl_description", formData.tl_description);
      if(file) {
        apiFormData.append("file", file);
      }

      await createTimeline(apiFormData);
      alert("Thêm lịch trình thành công!");
      onSuccess(); // Gọi hàm refresh data ở component cha
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
            <Input id="tl_title" name="tl_title" value={formData.tl_title} onChange={handleChange} />
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
            <Input id="images_upload" name="files" type="file" onChange={handleFileChange} required />
          </div>
          {/* Hiển thị preview tên file (tùy chọn) */}
          {file.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn: {file.map(f => f.name).join(', ')}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
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

// Dialog Edit Timeline
function EditTimelineForm({ timeline, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({ tl_title: '', tl_description: '' });
  const [loading, setLoading] = useState(false);

  // Khi `timeline` prop thay đổi (khi user bấm nút Sửa),
  // cập nhật state của form
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!timeline) return;

    setLoading(true);
    try {
      // Gọi API updateTimeline (PATCH /timelines/{id})
      await updateTimeline(timeline.timeLineId, formData);
      alert("Cập nhật lịch trình thành công!");
      onSuccess(); // Gọi hàm refresh data ở component cha
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
            <Input id="tl_title_edit" name="tl_title" value={formData.tl_title} onChange={handleChange} />
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
          {/* (Thêm input type="file" ở đây nếu bạn muốn cho phép cập nhật ảnh) */}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
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

// --- Component Quản lý Lịch trình (Timelines) ---
function EditTimelines({ tourId, timelines, onTimelinesUpdated }) {
  const [editingTimeline, setEditingTimeline] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const handleDelete = async (timelineId) => {
     if (window.confirm("Bạn chắc chắn muốn xóa mục lịch trình này?")) {
       try {
         await deleteTimeline(timelineId);
         onTimelinesUpdated(); // Gọi lại API fetch
       } catch (err) {
         alert("Lỗi khi xóa timeline.");
       }
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
                    <TableCell className="truncate max-w-xs">{item.tl_description.substring(0, 100)}...</TableCell>
                    <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => setEditingTimeline(item)}>
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.timeLineId)}>
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
            open={!!editingTimeline} // Chuyển object thành boolean (true nếu có object, false nếu null)
            onOpenChange={() => setEditingTimeline(null)} // Hàm để đóng dialog
            onSuccess={() => {
            setEditingTimeline(null); // Đóng dialog
            onTimelinesUpdated(); // Refresh lại bảng
            }}
        />
    </>
  );
}

// --- Component Quản lý Ngày khởi hành & Giá ---

// Dialog Add Start Date
function AddStartDateForm({ tourId, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({ tourId: tourId, startDate: '', endDate: '', priceAdult: 1000000, priceChildren: 500000, quantity: 10 });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        tourId: tourId,
        priceAdult: Number(formData.priceAdult),
        priceChildren: Number(formData.priceChildren),
        quantity: Number(formData.quantity),
        availability: 1,
      }
      
      await createStartDate(payload);
      alert("Thêm ngày khởi hành thành công!");
      onSuccess(); // Gọi hàm refresh data ở component cha
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
              <Input id="startDate_add" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="endDate_add">Ngày về</Label>
              <Input id="endDate_add" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceAdult_add">Giá Người lớn (VNĐ)</Label>
              <Input id="priceAdult_add" name="priceAdult" type="number" value={formData.priceAdult} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="priceChildren_add">Giá Trẻ em (VNĐ)</Label>
              <Input id="priceChildren_add" name="priceChildren" type="number" value={formData.priceChildren} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="quantity_add">Số chỗ</Label>
              <Input id="quantity_add" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
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

// --- (MỚI) Component Form Sửa Ngày/Giá (Dialog) ---
function EditStartDateForm({ tourId, startDate, open, onOpenChange, onSuccess }) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    priceAdult: 0,
    priceChildren: 0,
    quantity: 0,
  });
  const [loading, setLoading] = useState(false);

  // Hàm helper để format ISO string (2025-11-19T00:00:00.000Z)
  // về dạng YYYY-MM-DD (2025-11-19) cho input type="date"
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
  }, [startDate]);

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
              <Input id="startDate_edit" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="endDate_edit">Ngày về</Label>
              <Input id="endDate_edit" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="priceAdult_edit">Giá Người lớn (VNĐ)</Label>
              <Input id="priceAdult_edit" name="priceAdult" type="number" value={formData.priceAdult} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="priceChildren_edit">Giá Trẻ em (VNĐ)</Label>
              <Input id="priceChildren_edit" name="priceChildren" type="number" value={formData.priceChildren} onChange={handleChange} required />
            </div>
            <div>
              <Label htmlFor="quantity_edit">Số chỗ</Label>
              <Input id="quantity_edit" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
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

// Component Quản lý Ngày khởi hành & Giá
function EditStartDates({ tourId, startDates, onStartDatesUpdated }) {
  // (Logic quản lý Ngày/Giá: Thêm/Sửa/Xóa)

  const [editingStartDate, setEditingStartDate] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const handleDelete = async (dateId) => {
     if (window.confirm("Bạn chắc chắn muốn xóa ngày khởi hành này?")) {
       try {
         await deleteStartDate(dateId);
         onStartDatesUpdated(); // Gọi lại API fetch
       } catch (err) {
         alert("Lỗi khi xóa ngày khởi hành.");
       }
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
            {startDates.map((item) => (
              <TableRow key={item.dateId}>
                <TableCell>{format(new Date(item.startDate), "dd/MM/yyyy")}</TableCell>
                <TableCell>{format(new Date(item.endDate), "dd/MM/yyyy")}</TableCell>
                <TableCell>{item.priceAdult.toLocaleString("vi-VN")}₫</TableCell>
                <TableCell>{item.priceChildren.toLocaleString("vi-VN")}₫</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setEditingStartDate(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.dateId)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AddStartDateForm
      tourId={tourId}
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
      open={!!editingStartDate} // Chuyển object thành boolean (true nếu có object, false nếu null)
      onOpenChange={() => setEditingStartDate(null)} // Hàm để đóng dialog
      onSuccess={() => {
        setEditingStartDate(null); // Đóng dialog
        onStartDatesUpdated(); // Refresh lại bảng
      }}
    /> 
    </>
  );
}

// Component Quản lý Ảnh

function AddImagesForm({ tourId, open, onOpenChange, onSuccess }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files)); // Chuyển FileList thành Array
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh.");
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("tourId", tourId);
      // API /createMutipleImage (viết liền) mong đợi key là "files"
      for (const file of files) {
        formData.append("files", file);
      }
      
      const response = await createImages(formData);
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
            <Input id="images_upload" name="files" type="file" onChange={handleFileChange} multiple required />
          </div>
          {/* Hiển thị preview tên file (tùy chọn) */}
          {files.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Đã chọn: {files.map(f => f.name).join(', ')}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Hủy</Button>
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
    if (window.confirm("Bạn chắc chắn muốn xóa ảnh này?")) {
      try {
        await deleteImage(imageId);
        onImagesUpdated(); // Tải lại danh sách ảnh
      } catch (err) {
        alert("Lỗi khi xóa ảnh.");
      }
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
          {images.length === undefined ? (
            <p className="text-sm text-muted-foreground">Tour này chưa có ảnh gallery.</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.imageId} className="relative group border rounded-lg overflow-hidden">
                  <img
                    src={img.image || img.imageURL || img.url || ""} // fallback keys: image, imageURL, url
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
      
      {/* Dialog Thêm Ảnh */}
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

function EditTourHashtags({ tourId, linkedHashtags, onHashtagsUpdated }) {

  const safeLinkedHashtags = linkedHashtags || [];

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hashtag (để tìm kiếm) khi gõ
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      const formattedQuery = formatHashtag(searchQuery);
      const params = { hashtag: formattedQuery || undefined, limit: 20, page: 1 };
      const tags = await filterHashtags(params);
      setAvailableHashtags(tags?.hashtags);
      setLoading(false);
    };
    
    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Xóa (Unlink) một hashtag khỏi tour
  const handleDelete = async (tourHashTagId) => {
    if (window.confirm("Bạn chắc chắn muốn gỡ hashtag này khỏi tour?")) {
      try {
        await deleteTourHashtag(tourHashTagId);
        onHashtagsUpdated(); // Refresh lại list
      } catch (err) {
        alert("Lỗi khi gỡ hashtag.");
      }
    }
  };

  // Chọn 1 tag từ Combobox (để link)
  const handleSelect = async (tag) => {
    // Kiểm tra xem đã link chưa
    if (safeLinkedHashtags.find(item => item.hashtag.hashtagId === tag.hashtagId)) {
      setSearchQuery("");
      setOpen(false);
      return;
    }
    
    // Gọi API để link
    try {
      await linkTourToHashTag({ tourId, hashtagId: tag.hashtagId });
      onHashtagsUpdated(); // Refresh
    } catch (err) {
       alert("Lỗi khi gắn hashtag.");
    } finally {
      setSearchQuery("");
      setOpen(false);
    }
  };

  // Tạo tag mới (và link)
  const handleCreate = async () => {
    const formattedName = formatHashtag(searchQuery);
    if (!formattedName) return;

    // Kiểm tra xem tag (đã format) có trong API trả về không
    const existing = availableHashtags.find(t => t.name === formattedName);
    if (existing) {
      handleSelect(existing); // Nếu có, chỉ cần chọn
      return;
    }

    // Nếu không có, tạo mới
    setLoading(true);
    try {
      const newTag = await createHashtag({ 
        name: formattedName, 
        description: searchQuery 
      });
      await handleSelect(newTag); // Chọn (link) tag mới tạo
    } catch (err) {
      alert("Lỗi khi tạo tag mới.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
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
        {/* Combobox Tìm/Thêm */}
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
                  <Button variant="outline" size="sm" onClick={handleCreate} className="w-full">
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
                          safeLinkedHashtags.some(item => item.hashtag.hashtagId === tag.hashtagId) ? "opacity-100" : "opacity-0"
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

        {/* Danh sách tag đã gắn */}
        <div className="space-y-2">
          <Label>Các tag đã gắn:</Label>
          <div className="flex flex-wrap gap-2">
            {safeLinkedHashtags.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có tag nào.</p>
            )}
            {/* Giả định API trả về: { tourHashTagId: 123, hashtag: { ... } } */}
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

// --- Trang Cha (Page) ---
export function ManageTourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [timelines, setTimelines] = useState([]);
  const [startDates, setStartDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [hashtags, setHashtags] = useState([]); 

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Chạy song song 3 API
      const [tourData, timelineData, startDatesData, imagesData, hashtagData] = await Promise.all([
        getTourById(id),
        getTimelineByTourId(id),
        getStartDatesByTourId(id),
        getImagesByTourId(id),
        getHashtagsForTour(id),
      ]);
      setTour(tourData);
      setTimelines(timelineData);
      setStartDates(startDatesData);
      setImages(imagesData);
      setHashtags(hashtagData);
      console.log("XP-DEBUG-Hashtags: ", hashtagData);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu tour chi tiết:", err);
      setError("Không thể tải dữ liệu tour.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchImages = async () => {
     try {
       const imagesData = await getImagesByTourId(id);
       // Lọc bỏ ảnh bìa (image) ra khỏi danh sách gallery (images)
       // (Giả định tour.image là 1 trong các ảnh của /images/TourId)
       // Hoặc API /images/TourId trả về TẤT CẢ ảnh gallery
       setImages(imagesData);
    } catch (err) {
       console.error("Lỗi tải ảnh:", err);
       setError("Không thể tải ảnh gallery.");
    }
  };

  const fetchHashtags = async () => {
     try {
       const hashtagData = await getHashtagsForTour(id);
       setHashtags(hashtagData); 
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
    <div className="p-6 md:p-14 space-y-8">
      <Button variant="outline" onClick={() => navigate("/admin/tours")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại danh sách
      </Button>
      
      <h1 className="text-3xl font-bold text-foreground">
        Chỉnh sửa Tour: <span className="text-primary">{tour.title}</span>
      </h1>
      
      {/* Form Sửa Thông tin Cơ bản */}
      <EditTourInfo 
        tour={tour} 
        onTourUpdated={(updatedTour) => setTour(updatedTour)} 
      />

      {/* Form Thêm Xoá ảnh */}
      <EditTourImages 
        tourId={tour.tourId}
        images={images}
        onImagesUpdated={fetchImages} // Tải lại CHỈ ảnh
      />

      {/* Form Quản lý Hashtags */}
      <EditTourHashtags 
        tourId={tour.tourId}
        linkedHashtags={hashtags.tourHashtags}
        onHashtagsUpdated={fetchHashtags} // Tải lại CHỈ hashtag
      />
      
      {/* Form Quản lý Lịch trình */}
      <EditTimelines 
        tourId={tour.tourId} 
        timelines={timelines} 
        onTimelinesUpdated={fetchData} // Tải lại toàn bộ
      />
      
      {/* Form Quản lý Ngày/Giá */}
      <EditStartDates 
        tourId={tour.tourId} 
        startDates={startDates} 
        onStartDatesUpdated={fetchData} // Tải lại toàn bộ
      />
    </div>
  );
}
