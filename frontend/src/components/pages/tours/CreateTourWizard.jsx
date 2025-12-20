import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Loader2, Plus, Trash2, Check, X, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/context/useAuth"; // Import useAuth
import { createTour, createTimeline, createStartDate, createImages } from "@/api/tours";
import { filterHashtags, createHashtag, linkTourToHashTag } from "@/api/hashtags";
import slugify from "slugify";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput, 
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {Badge} from "@/components/ui/badge"

// Function Format Hashtag
const formatHashtag = (text) => {
  // Bỏ dấu '#', ' ', v.v.
  const cleaned = text.replace(/#/g, "").trim();
  if (!cleaned) return null;

  // "5 ngày 4 đêm" -> "5-ngay-4-dem"
  const slug = slugify(cleaned, { 
    lower: true,      // Chữ thường
    strict: true,     // Bỏ ký tự đặc biệt
    locale: 'vi'      // Xử lý tiếng Việt
  });
  
  // "5-ngay-4-dem" -> "5ngay4dem" (Bỏ dấu gạch ngang)
  const formatted = slug.replace(/-/g, '');
  
  return `#${formatted}`; // Trả về #5ngay4dem
};

function HashtagCombobox({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableHashtags, setAvailableHashtags] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách hashtag khi gõ
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      // Format từ khóa tìm kiếm (ví dụ: gõ "Đà Nẵng" -> tìm "#danang")
      const formattedQuery = formatHashtag(searchQuery);
      const params = { 
        hashtag: formattedQuery || undefined, // Gửi #danang
        limit: 20, 
        page: 1 
      };
      const tags = await filterHashtags(params);
      setAvailableHashtags(tags.hashtags);
      setLoading(false);
    };
    
    // Dùng setTimeout (debounce) để tránh gọi API liên tục
    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
    
  }, [searchQuery]);

  // Hàm chọn một tag (từ danh sách)
  const handleSelect = (tag) => {
    if (!value.find(item => item.hashtagId === tag.hashtagId)) {
      onChange([...value, tag]);
    }
    setSearchQuery("");
    setOpen(false);
  };

  // Hàm tạo tag mới
  const handleCreate = async () => {
    const formattedName = formatHashtag(searchQuery);
    if (!formattedName) return;

    // Kiểm tra xem tag (đã format) có trong danh sách đã chọn chưa
    if (value.some(tag => tag.name === formattedName)) {
      setSearchQuery("");
      setOpen(false);
      return;
    }
    
    // Kiểm tra xem tag (đã format) có trong API trả về không
    const existing = availableHashtags.find(t => t.name === formattedName);
    if (existing) {
      handleSelect(existing); // Nếu có, chỉ cần chọn nó
      return;
    }

    // Nếu không có, tạo mới
    setLoading(true);
    try {
      const newTag = await createHashtag({ 
        name: formattedName, // Gửi đi: #danang
        description: searchQuery // Gửi đi: Đà Nẵng
      });
      handleSelect(newTag); // Chọn tag mới tạo
    } catch (err) {
      alert("Lỗi khi tạo tag mới.");
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm bỏ chọn 1 tag
  const handleUnselect = (tagToRemove) => {
    onChange(value.filter(tag => tag.hashtagId !== tagToRemove.hashtagId));
  };
  
  // (SỬA) Xử lý khi bấm Enter (hoặc Space)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // Ngăn submit form / gõ dấu cách
      handleCreate();
    }
  };

  return (
    <div className="space-y-2">
      <Label>Hashtags (Gắn thẻ)</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-[40px]" // Sửa: Thêm min-h
          >
            <div className="flex flex-wrap gap-1">
              {value.length === 0 && <span className="text-muted-foreground">Chọn hoặc tạo hashtag...</span>}
              {value.map((tag) => (
                <Badge
                  key={tag.hashtagId}
                  variant="secondary"
                  className="pl-2 pr-1"
                  onClick={(e) => {
                     e.stopPropagation(); // Ngăn popover mở
                     handleUnselect(tag);
                  }}
                >
                  {tag.name}
                  <X className="w-3 h-3 ml-1 cursor-pointer" />
                </Badge>
              ))}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command>
            <CommandInput 
              placeholder="Gõ tag (ví dụ: Đà Nẵng) rồi Enter..." 
              value={searchQuery}
              onValueChange={setSearchQuery}
              onKeyDown={handleKeyDown} // <-- Bắt sự kiện Enter/Space
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
                      className={(
                        "mr-2 h-4 w-4",
                        value.some(item => item.hashtagId === tag.hashtagId) ? "opacity-100" : "opacity-0"
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
    </div>
  );
}

// --- Form cho Step 1: Tour cơ bản ---
function Step1Form({ onSubmit, loading }) {
  const { user } = useAuth(); // Lấy user để lấy userId
  const [formData, setFormData] = useState({
    title: "",
    destination: "",
    days: "3",
    nights: "2",
    quantity: 30,
    description: "", 
    file: null, 
    hashtags: [],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHashtagChange = (newHashtags) => {
     setFormData((prev) => ({ ...prev, hashtags: newHashtags }));
  };


  const handleFileChange = (e) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert("Vui lòng chọn ảnh đại diện cho tour.");
      return;
    }

    const timeString = `${formData.days} ngày ${formData.nights} đêm`;

    const apiFormData = new FormData();
    apiFormData.append("title", formData.title);
    apiFormData.append("destination", formData.destination);
    apiFormData.append("time", timeString);
    apiFormData.append("quantity", formData.quantity);
    apiFormData.append("highlight", formData.highlight); // string (Tour bao gồm)
    apiFormData.append("description", formData.description);
    apiFormData.append("file", formData.file);
    apiFormData.append("userId", user.userId); // Lấy userId từ AuthContext

    console.log("XP-DEBUG-apiFormData: ", apiFormData);

    onSubmit(apiFormData, formData.hashtags);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Tên Tour</Label>
          <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="destination">Điểm đến</Label>
          <Input id="destination" name="destination" value={formData.destination} onChange={handleChange} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thời gian</Label>
          <div className="flex items-center gap-2">
            <Input name="days" type="number" min="0" value={formData.days} onChange={handleChange} className="w-20"/>
            <span>ngày</span>
            <Input name="nights" type="number" min="0" value={formData.nights} onChange={handleChange} className="w-20"/>
            <span>đêm</span>
          </div>
        </div>
        <div>            
          <Label htmlFor="quantity">Số lượng chỗ</Label>
          <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} required />
        </div>
      </div>

      <HashtagCombobox
        value={formData.hashtags}
        onChange={handleHashtagChange}
      />

      <div>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="highlight">Tour bao gồm (mỗi gạch đầu dòng 1 hàng)</Label>
        <Textarea id="highlight" name="highlight" value={formData.highlight} onChange={handleChange} placeholder="-" />
      </div>
      <div>
        <Label htmlFor="file">Ảnh đại diện (Thumbnail)</Label>
        <Input id="file" name="file" type="file" onChange={handleFileChange} required />
      </div>
      <DialogFooter>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Tiếp tục (Step 2)
        </Button>
      </DialogFooter>
    </form>
  );
}

// --- Form cho Step 2: Image Gallery ---
function Step2Form({ tourId, onSubmit, onBack, loading }) {
  const [files, setFiles] = useState([]);

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
    try {
      const formData = new FormData();
      formData.append("tourId", tourId);
      // API /createMutipleImage (viết liền) mong đợi key là "files"
      for (const file of files) {
        formData.append("files", file);
      }
      onSubmit(formData);
    } catch (err) {
      alert("Lỗi khi tải ảnh lên.");
    } 
  };
  
  return (
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
            <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
              Quay lại
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Tiếp tục (Step 3)
            </Button>
          </DialogFooter>
        </form>
     
  );
}

// --- Form cho Step 3: Lịch trình (Timelines) ---
function Step3Form({ tourId, onSubmit, onBack, loading }) {
  const [timelines, setTimelines] = useState([
    { tl_title: "Ngày 1", tl_description: "", file: null },
  ]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newTimelines = [...timelines];
    newTimelines[index][name] = value;
    setTimelines(newTimelines);
  };

  const handleFileChange = (index, e) => {
    if (e.target.files) {
      const newTimelines = [...timelines];
      newTimelines[index].file = e.target.files[0];
      setTimelines(newTimelines);
    }
  };

  const addTimeline = () => {
    setTimelines([
      ...timelines,
      { tl_title: `Ngày ${timelines.length + 1}`, tl_description: "", file: null },
    ]);
  };

  const removeTimeline = (index) => {
    setTimelines(timelines.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(timelines);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {timelines.map((item, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-lg relative">
          <Label>Mục Lịch trình {index + 1}</Label>
          <Input
            name="tl_title"
            placeholder="Tiêu đề (ví dụ: Ngày 1: Hà Nội - Đà Lạt)"
            value={item.tl_title}
            onChange={(e) => handleChange(index, e)}
            required
          />
          <Textarea
            name="tl_description"
            placeholder="Mô tả chi tiết (HTML)..."
            value={item.tl_description}
            onChange={(e) => handleChange(index, e)}
            required
          />
          <Input
            name="file"
            type="file"
            onChange={(e) => handleFileChange(index, e)}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6"
            onClick={() => removeTimeline(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addTimeline}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm ngày
      </Button>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Quay lại
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Tiếp tục (Step 4)
        </Button>
      </DialogFooter>
    </form>
  );
}

// --- Form cho Step 3: Ngày khởi hành & Giá ---
function Step4Form({ tourId, onSubmit, onBack, loading }) {
  const [dates, setDates] = useState([
    { startDate: "", endDate: "", priceAdult: 1000000, priceChildren: 700000, quantity: 30 },
  ]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newDates = [...dates];
    newDates[index][name] = value;
    setDates(newDates);
  };

  const addDate = () => {
    setDates([
      ...dates,
      { startDate: "", endDate: "", priceAdult: 1000000, priceChildren: 700000, quantity: 30 },
    ]);
  };

  const removeDate = (index) => {
    setDates(dates.filter((_, i) => i !== index));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(dates);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
      {dates.map((item, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-lg relative">
          <Label>Ngày khởi hành {index + 1}</Label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày đi</Label>
              <Input name="startDate" type="date" value={item.startDate} onChange={(e) => handleChange(index, e)} required />
            </div>
            <div>
              <Label>Ngày về</Label>
              <Input name="endDate" type="date" value={item.endDate} onChange={(e) => handleChange(index, e)} required />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
             <div>
              <Label>Giá Người lớn (VNĐ)</Label>
              <Input name="priceAdult" type="number" value={item.priceAdult} onChange={(e) => handleChange(index, e)} required />
            </div>
            <div>
              <Label>Giá Trẻ em (VNĐ)</Label>
              <Input name="priceChildren" type="number" value={item.priceChildren} onChange={(e) => handleChange(index, e)} required />
            </div>
             <div>
              <Label>Số chỗ</Label>
              <Input name="quantity" type="number" value={item.quantity} onChange={(e) => handleChange(index, e)} required />
            </div>
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6"
            onClick={() => removeDate(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" onClick={addDate}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm ngày khởi hành
      </Button>
      <DialogFooter>
        <Button type="button" variant="ghost" onClick={onBack} disabled={loading}>
          Quay lại
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Hoàn tất
        </Button>
      </DialogFooter>
    </form>
  );
}


// --- Component Wizard Chính ---
export function CreateTourWizard({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1);
  const [newTourId, setNewTourId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state khi đóng
    setTimeout(() => {
      setStep(1);
      setNewTourId(null);
      setLoading(false);
    }, 300);
  };

  const handleStep1Submit = async (formData, hashtags) => {
    try {
      setLoading(true);
      const newTour = await createTour(formData); 
      setNewTourId(newTour.tourId);

      if (hashtags && hashtags.length > 0) {
        for (const tag of hashtags) {
          await linkTourToHashTag({
            tourId: newTour.tourId,
            hashtagId: tag.hashtagId
          });
        }
      }
      setStep(2);
    } catch (err) {
      alert("Lỗi tạo tour. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (formData) => {
    try {
      setLoading(true);
      const res = await createImages(formData);
      console.log("createImages response:", res);
      alert("Tải ảnh lên gallery thành công!");
      setStep(3);
    } catch {
      alert("Lỗi khi thêm ảnh vào gallery. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const handleStep3Submit = async (timelines) => {
    try {
      setLoading(true);
      // Gọi API cho từng mục timeline
      for (const item of timelines) {
        const formData = new FormData();
        formData.append("tourId", newTourId);
        formData.append("tl_title", item.tl_title);
        formData.append("tl_description", item.tl_description);
        if (item.file) {
          formData.append("file", item.file);
        }
        await createTimeline(formData);
      }
      setStep(4);
    } catch (err) {
      alert("Lỗi khi thêm lịch trình. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep4Submit = async (dates) => {
    try {
      setLoading(true);
      // Gọi API cho từng mục ngày/giá
      for (const item of dates) {
        const dateData = {
          tourId: newTourId,
          startDate: item.startDate,
          endDate: item.endDate,
          priceAdult: Number(item.priceAdult),
          priceChildren: Number(item.priceChildren),
          quantity: Number(item.quantity),
          availability: 1, // Mặc định là 1 (còn chỗ)
        };
        await createStartDate(dateData);
      }
      alert("Tạo tour thành công!");
      onSuccess(); // Gọi hàm onSuccess (từ ManageToursPage) để tải lại danh sách
    } catch (err) {
      alert("Lỗi khi thêm ngày khởi hành. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo Tour Mới (Bước {step}/4)</DialogTitle>
          {step === 1 && <DialogDescription>Thông tin cơ bản về tour của bạn.</DialogDescription>}
          {step === 2 && <DialogDescription>Upload Image To Gallery</DialogDescription>}
          {step === 3 && <DialogDescription>Chi tiết lịch trình (timeline) cho Tour ID: {newTourId}</DialogDescription>}
          {step === 4 && <DialogDescription>Ngày khởi hành và giá vé cho Tour ID: {newTourId}</DialogDescription>}
        </DialogHeader>

        {step === 1 && <Step1Form onSubmit={handleStep1Submit} loading={loading} />}
        
        {step === 2 && (
          <Step2Form
            tourId={newTourId}
            onSubmit={handleStep2Submit}
            onBack={() => setStep(1)}
            loading={loading}
          />
        )}

        {step === 3 && (
          <Step3Form
            tourId={newTourId}
            onSubmit={handleStep3Submit}
            onBack={() => setStep(2)}
            loading={loading}
          />
        )}

        {step === 4 && (
          <Step4Form
            tourId={newTourId}
            onSubmit={handleStep4Submit}
            onBack={() => setStep(3)}
            loading={loading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

