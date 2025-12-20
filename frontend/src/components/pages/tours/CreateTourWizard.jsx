import { useState, useEffect, useMemo, useRef } from "react";
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Loader2, Plus, Trash2, Check, X, ChevronsUpDown } from "lucide-react";
import { useAuth } from "@/context/useAuth"; // Import useAuth
import {
  createTour,
  createTimeline,
  createStartDate,
  createImages,
} from "@/api/tours";
import {
  filterHashtags,
  createHashtag,
  linkTourToHashTag,
} from "@/api/hashtags";
import slugify from "slugify";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

// Function Format Hashtag
const formatHashtag = (text) => {
  // Bỏ dấu '#', ' ', v.v.
  const cleaned = text.replace(/#/g, "").trim();
  if (!cleaned) return null;

  // "5 ngày 4 đêm" -> "5-ngay-4-dem"
  const slug = slugify(cleaned, {
    lower: true, // Chữ thường
    strict: true, // Bỏ ký tự đặc biệt
    locale: "vi", // Xử lý tiếng Việt
  });

  // "5-ngay-4-dem" -> "5ngay4dem" (Bỏ dấu gạch ngang)
  const formatted = slug.replace(/-/g, "");

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
        page: 1,
      };

      try {
        const tags = await filterHashtags(params);
        setAvailableHashtags(tags?.hashtags || []);
      } catch (e) {
        setAvailableHashtags([]);
      } finally {
        setLoading(false);
      }
    };

    // Dùng setTimeout (debounce) để tránh gọi API liên tục
    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Hàm chọn một tag (từ danh sách)
  const handleSelect = (tag) => {
    if (!value.find((item) => item.hashtagId === tag.hashtagId)) {
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
    if (value.some((tag) => tag.name === formattedName)) {
      setSearchQuery("");
      setOpen(false);
      return;
    }

    // Kiểm tra xem tag (đã format) có trong API trả về không
    const existing = availableHashtags.find((t) => t.name === formattedName);
    if (existing) {
      handleSelect(existing); // Nếu có, chỉ cần chọn nó
      return;
    }

    // Nếu không có, tạo mới
    setLoading(true);
    try {
      const newTag = await createHashtag({
        name: formattedName, // Gửi đi: #danang
        description: searchQuery, // Gửi đi: Đà Nẵng
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
    onChange(value.filter((tag) => tag.hashtagId !== tagToRemove.hashtagId));
  };

  // (SỬA) Xử lý khi bấm Enter (hoặc Space)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
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
              {value.length === 0 && (
                <span className="text-muted-foreground">
                  Chọn hoặc tạo hashtag...
                </span>
              )}
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
                    {/* ✅ FIX: className trước đây dùng comma operator sai */}
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        value.some((item) => item.hashtagId === tag.hashtagId)
                          ? "opacity-100"
                          : "opacity-0"
                      }`}
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
function Step1Form({ onSubmit, loading, initialData, onDraftChange }) {
  const { user } = useAuth(); // Lấy user để lấy userId

  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      destination: "",
      days: "3",
      nights: "2",
      quantity: 30,
      description: "",
      highlight: "", // ✅ FIX: trước đó thiếu field này
      file: null,
      hashtags: [],
    }
  );

  // ✅ FIX: cờ để tránh vòng lặp sync (hydrate -> sync -> hydrate...)
  const isHydratingRef = useRef(false);

  // ✅ FIX: khi quay lại Step 1, nạp lại draft từ Wizard
  useEffect(() => {
    if (!initialData) return;

    // Chỉ set nếu initialData thật sự khác formData hiện tại
    const same =
      formData.title === initialData.title &&
      formData.destination === initialData.destination &&
      String(formData.days) === String(initialData.days) &&
      String(formData.nights) === String(initialData.nights) &&
      String(formData.quantity) === String(initialData.quantity) &&
      formData.description === initialData.description &&
      formData.highlight === initialData.highlight &&
      (formData.file?.name || "") === (initialData.file?.name || "") &&
      (formData.file?.size || 0) === (initialData.file?.size || 0) &&
      JSON.stringify((formData.hashtags || []).map((t) => t.hashtagId)) ===
        JSON.stringify((initialData.hashtags || []).map((t) => t.hashtagId));

    if (same) return;

    isHydratingRef.current = true;
    setFormData(initialData);
  }, [initialData]); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ FIX QUAN TRỌNG: sync local -> Wizard SAU render
  // Nhưng bỏ qua lần render do hydrate để tránh loop
  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }
    onDraftChange?.(formData);
  }, [formData, onDraftChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHashtagChange = (newHashtags) => {
    setFormData((prev) => ({ ...prev, hashtags: newHashtags }));
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const file = e.target.files[0];

      // ✅ Validate file type (ảnh)
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (file && !validTypes.includes(file.type)) {
        alert("Ảnh đại diện chỉ chấp nhận JPG/PNG/WEBP.");
        e.target.value = "";
        return;
      }

      // ✅ (Tuỳ chọn) Validate size (ví dụ 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file && file.size > maxSize) {
        alert("Ảnh đại diện quá lớn. Vui lòng chọn ảnh <= 5MB.");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ VALIDATE input fields (Step 1)
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tên tour.");
      return;
    }

    if (!formData.destination.trim()) {
      alert("Vui lòng nhập điểm đến.");
      return;
    }

    const daysNum = Number(formData.days);
    const nightsNum = Number(formData.nights);
    const quantityNum = Number(formData.quantity);

    if (!Number.isFinite(daysNum) || daysNum <= 0) {
      alert("Số ngày phải > 0.");
      return;
    }

    if (!Number.isFinite(nightsNum) || nightsNum < 0) {
      alert("Số đêm không hợp lệ.");
      return;
    }

    // Bạn có thể bật rule này nếu muốn nights <= days
    if (nightsNum > daysNum) {
      alert("Số đêm không thể lớn hơn số ngày.");
      return;
    }

    if (!Number.isFinite(quantityNum) || quantityNum <= 0) {
      alert("Số lượng chỗ phải > 0.");
      return;
    }

    if (!formData.description.trim()) {
      alert("Vui lòng nhập mô tả chi tiết.");
      return;
    }

    if (!formData.highlight.trim()) {
      alert("Vui lòng nhập phần 'Tour bao gồm'.");
      return;
    }

    if (!formData.file) {
      alert("Vui lòng chọn ảnh đại diện cho tour.");
      return;
    }

    const timeString = `${formData.days} ngày ${formData.nights} đêm`;

    const apiFormData = new FormData();
    apiFormData.append("title", formData.title.trim());
    apiFormData.append("destination", formData.destination.trim());
    apiFormData.append("time", timeString);
    apiFormData.append("quantity", String(quantityNum));
    apiFormData.append("highlight", formData.highlight); // string (Tour bao gồm)
    apiFormData.append("description", formData.description);
    apiFormData.append("file", formData.file);
    apiFormData.append("userId", String(user.userId)); // Lấy userId từ AuthContext

    console.log("XP-DEBUG-apiFormData: ", apiFormData);

    onSubmit(apiFormData, formData.hashtags);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Tên Tour</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="destination">Điểm đến</Label>
          <Input
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thời gian</Label>
          <div className="flex items-center gap-2">
            <Input
              name="days"
              type="number"
              min="1"
              value={formData.days}
              onChange={handleChange}
              className="w-20"
              required
            />
            <span>ngày</span>
            <Input
              name="nights"
              type="number"
              min="0"
              value={formData.nights}
              onChange={handleChange}
              className="w-20"
              required
            />
            <span>đêm</span>
          </div>
        </div>

        <div>
          <Label htmlFor="quantity">Số lượng chỗ</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <HashtagCombobox
        value={formData.hashtags}
        onChange={handleHashtagChange}
      />

      <div>
        <Label htmlFor="description">Mô tả chi tiết</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <Label htmlFor="highlight">
          Tour bao gồm (mỗi gạch đầu dòng 1 hàng)
        </Label>
        <Textarea
          id="highlight"
          name="highlight"
          value={formData.highlight}
          onChange={handleChange}
          placeholder="-"
          required
        />
      </div>

      <div>
        <Label htmlFor="file">Ảnh đại diện (Thumbnail)</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          required
        />
        {/* ✅ input file không giữ value khi back step, nên show tên file để biết nó vẫn được lưu */}
        {formData.file && (
          <div className="text-sm text-muted-foreground mt-1">
            Đã chọn: {formData.file.name} (
            {Math.round(formData.file.size / 1024)} KB)
          </div>
        )}
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
function Step2Form({
  onSubmit,
  onBack,
  loading,
  initialFiles = [],
  onDraftChange,
}) {
  const [files, setFiles] = useState(initialFiles);

  // ✅ FIX (Cách 1): khi quay lại Step 2, nạp lại draft từ Wizard
  useEffect(() => {
    setFiles(initialFiles || []);
  }, [initialFiles]);

  const totalSizeBytes = useMemo(() => {
    return (files || []).reduce((sum, f) => sum + (f?.size || 0), 0);
  }, [files]);

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // ✅ Validate file types
      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const invalid = selectedFiles.find((f) => !validTypes.includes(f.type));
      if (invalid) {
        alert("Gallery chỉ chấp nhận ảnh JPG/PNG/WEBP.");
        e.target.value = "";
        return;
      }

      // ✅Validate size per file (5MB)
      const maxSize = 5 * 1024 * 1024;
      const tooBig = selectedFiles.find((f) => f.size > maxSize);
      if (tooBig) {
        alert("Có ảnh > 5MB. Vui lòng chọn ảnh nhỏ hơn.");
        e.target.value = "";
        return;
      }

      setFiles(selectedFiles); // Chuyển FileList thành Array
      onDraftChange?.(selectedFiles); // ✅ FIX: lưu ngay để quay lại không mất
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh.");
      return;
    }
    try {
      // ✅ FIX (Cách 1): Step 2 chưa gọi API, chỉ lưu files lên Wizard
      onSubmit(files);
    } catch (err) {
      alert("Lỗi khi tải ảnh lên.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="images_upload">Chọn ảnh</Label>
        <Input
          id="images_upload"
          name="files"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          multiple
          required
        />
      </div>

      {/* Hiển thị preview tên file (tùy chọn) */}
      {files.length > 0 && (
        <div className="text-sm text-muted-foreground space-y-2">
          <div>
            Đã chọn {files.length} ảnh • Tổng dung lượng:{" "}
            {formatBytes(totalSizeBytes)}
          </div>
          <div className="break-words">
            {files.map((f) => f.name).join(", ")}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setFiles([]);
              onDraftChange?.([]); // ✅ giữ sync draft
            }}
          >
            Xoá tất cả ảnh đã chọn
          </Button>
        </div>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={loading}
        >
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
function Step3Form({
  onSubmit,
  onBack,
  loading,
  initialTimelines,
  onDraftChange,
}) {
  const [timelines, setTimelines] = useState(
    initialTimelines?.length
      ? initialTimelines
      : [{ tl_title: "Ngày 1", tl_description: "", file: null }]
  );

  // ✅ FIX (Cách 1): khi quay lại Step 3, nạp lại draft từ Wizard
  useEffect(() => {
    if (initialTimelines?.length) setTimelines(initialTimelines);
  }, [initialTimelines]);

  // ✅ FIX: Sync local -> parent draft sau khi render (tránh setState trong render)
  useEffect(() => {
    onDraftChange?.(timelines);
  }, [timelines, onDraftChange]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setTimelines((prev) => {
      const next = [...prev];
      next[index][name] = value;
      return next;
    });
  };

  const handleFileChange = (index, e) => {
    if (e.target.files) {
      const file = e.target.files[0];

      // ✅ Validate file type (ảnh) nếu có upload
      if (file) {
        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
          alert("Ảnh timeline chỉ chấp nhận JPG/PNG/WEBP.");
          e.target.value = "";
          return;
        }
      }

      setTimelines((prev) => {
        const next = [...prev];
        next[index].file = file || null;
        return next;
      });
    }
  };

  const addTimeline = () => {
    setTimelines((prev) => [
      ...prev,
      {
        tl_title: `Ngày ${prev.length + 1}`,
        tl_description: "",
        file: null,
      },
    ]);
  };

  const removeTimeline = (index) => {
    setTimelines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ VALIDATE timeline items
    for (let i = 0; i < timelines.length; i++) {
      const item = timelines[i];
      if (!item.tl_title?.trim()) {
        alert(`Vui lòng nhập tiêu đề cho lịch trình #${i + 1}.`);
        return;
      }
      if (!item.tl_description?.trim()) {
        alert(`Vui lòng nhập mô tả cho lịch trình #${i + 1}.`);
        return;
      }
    }

    // ✅ FIX (Cách 1): Step 3 chưa gọi API, chỉ lưu timelines lên Wizard
    onSubmit(timelines);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
    >
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
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleFileChange(index, e)}
          />
          {item.file && (
            <div className="text-sm text-muted-foreground">
              Đã chọn: {item.file.name} ({Math.round(item.file.size / 1024)} KB)
            </div>
          )}

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6"
            onClick={() => removeTimeline(index)}
            disabled={timelines.length === 1} // ✅ tránh xoá hết
            title={timelines.length === 1 ? "Phải có ít nhất 1 ngày" : "Xóa"}
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
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={loading}
        >
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
function Step4Form({
  onSubmit,
  onBack,
  loading,
  initialDates,
  onDraftChange,
  summary,
}) {
  const [dates, setDates] = useState(
    initialDates?.length
      ? initialDates
      : [
          {
            startDate: "",
            endDate: "",
            priceAdult: 1000000,
            priceChildren: 700000,
            quantity: 30,
          },
        ]
  );

  // ✅ FIX (Cách 1): khi quay lại Step 4, nạp lại draft từ Wizard
  useEffect(() => {
    if (initialDates?.length) setDates(initialDates);
  }, [initialDates]);

  // ✅ FIX: Sync local -> parent draft sau khi render (tránh setState trong render)
  useEffect(() => {
    onDraftChange?.(dates);
  }, [dates, onDraftChange]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setDates((prev) => {
      const next = [...prev];
      next[index][name] = value;
      return next;
    });
  };

  const addDate = () => {
    setDates((prev) => [
      ...prev,
      {
        startDate: "",
        endDate: "",
        priceAdult: 1000000,
        priceChildren: 700000,
        quantity: 30,
      },
    ]);
  };

  const removeDate = (index) => {
    setDates((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ VALIDATE dates
    for (let i = 0; i < dates.length; i++) {
      const item = dates[i];

      if (!item.startDate || !item.endDate) {
        alert(`Vui lòng chọn ngày đi và ngày về cho mục #${i + 1}.`);
        return;
      }

      const start = new Date(item.startDate);
      const end = new Date(item.endDate);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        alert(`Ngày không hợp lệ ở mục #${i + 1}.`);
        return;
      }

      if (start >= end) {
        alert(`Ngày về phải sau ngày đi (mục #${i + 1}).`);
        return;
      }

      const adult = Number(item.priceAdult);
      const child = Number(item.priceChildren);
      const qty = Number(item.quantity);

      if (!Number.isFinite(adult) || adult <= 0) {
        alert(`Giá người lớn phải > 0 (mục #${i + 1}).`);
        return;
      }

      if (!Number.isFinite(child) || child < 0) {
        alert(`Giá trẻ em không hợp lệ (mục #${i + 1}).`);
        return;
      }

      if (!Number.isFinite(qty) || qty <= 0) {
        alert(`Số chỗ phải > 0 (mục #${i + 1}).`);
        return;
      }
    }

    onSubmit(dates);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
    >
      {/* ✅ FIX (Cách 1): Summary trước khi bấm hoàn tất */}
      <div className="border rounded-lg p-4 space-y-2 bg-muted/20">
        <div className="font-semibold">Tóm tắt dữ liệu</div>
        <div className="text-sm text-muted-foreground">
          <div>
            <span className="font-medium text-foreground">Tên tour:</span>{" "}
            {summary?.title || "(chưa nhập)"}
          </div>
          <div>
            <span className="font-medium text-foreground">Điểm đến:</span>{" "}
            {summary?.destination || "(chưa nhập)"}
          </div>
          <div>
            <span className="font-medium text-foreground">Thumbnail:</span>{" "}
            {summary?.thumbnailName || "(chưa chọn)"}
          </div>
          <div>
            <span className="font-medium text-foreground">Số ảnh gallery:</span>{" "}
            {summary?.imagesCount ?? 0}{" "}
            {summary?.galleryTotalSize ? `• ${summary.galleryTotalSize}` : ""}
          </div>
          <div>
            <span className="font-medium text-foreground">
              Số ngày timeline:
            </span>{" "}
            {summary?.timelinesCount ?? 0}
          </div>
          <div>
            <span className="font-medium text-foreground">
              Số lịch khởi hành:
            </span>{" "}
            {dates.length}
          </div>
        </div>
      </div>

      {dates.map((item, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-lg relative">
          <Label>Ngày khởi hành {index + 1}</Label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ngày đi</Label>
              <Input
                name="startDate"
                type="date"
                value={item.startDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div>
              <Label>Ngày về</Label>
              <Input
                name="endDate"
                type="date"
                value={item.endDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Giá Người lớn (VNĐ)</Label>
              <Input
                name="priceAdult"
                type="number"
                min="1"
                value={item.priceAdult}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>

            <div>
              <Label>Giá Trẻ em (VNĐ)</Label>
              <Input
                name="priceChildren"
                type="number"
                min="0"
                value={item.priceChildren}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>

            <div>
              <Label>Số chỗ</Label>
              <Input
                name="quantity"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 w-6 h-6"
            onClick={() => removeDate(index)}
            disabled={dates.length === 1} // ✅ tránh xoá hết
            title={
              dates.length === 1 ? "Phải có ít nhất 1 lịch khởi hành" : "Xóa"
            }
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
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={loading}
        >
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

  // ✅ FIX (Cách 1): Lưu dữ liệu các bước, chỉ gọi API ở bước cuối
  const [draftStep1Raw, setDraftStep1Raw] = useState(null); // raw fields step1
  const [draftStep1, setDraftStep1] = useState(null); // { formData: FormData, hashtags: [] }
  const [draftGalleryFiles, setDraftGalleryFiles] = useState([]); // File[]
  const [draftTimelines, setDraftTimelines] = useState([]); // [{tl_title, tl_description, file}]
  const [draftDates, setDraftDates] = useState([]); // [{startDate, endDate, priceAdult, priceChildren, quantity}]

  const formatBytes = (bytes) => {
    if (!bytes || bytes <= 0) return "0 B";
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const galleryTotalSizeBytes = useMemo(() => {
    return (draftGalleryFiles || []).reduce(
      (sum, f) => sum + (f?.size || 0),
      0
    );
  }, [draftGalleryFiles]);

  const handleClose = () => {
    onOpenChange(false);
    // Reset state khi đóng
    setTimeout(() => {
      setStep(1);
      setNewTourId(null);
      setLoading(false);

      // ✅ FIX (Cách 1): Reset draft
      setDraftStep1Raw(null);
      setDraftStep1(null);
      setDraftGalleryFiles([]);
      setDraftTimelines([]);
      setDraftDates([]);
    }, 300);
  };

  // ✅ FIX: Dialog onOpenChange không nên luôn đóng
  const handleDialogOpenChange = (nextOpen) => {
    if (!nextOpen) {
      handleClose();
    } else {
      onOpenChange(true);
    }
  };

  const handleStep1Submit = async (formData, hashtags) => {
    try {
      setLoading(true);

      // ✅ FIX (Cách 1): Step 1 chưa gọi API, chỉ lưu lại draft
      setDraftStep1({ formData, hashtags });

      // (Không tạo tour ở đây nữa)
      setNewTourId(null);

      setStep(2);
    } catch (err) {
      alert("Lỗi tạo tour. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (files) => {
    try {
      setLoading(true);

      // ✅ FIX (Cách 1): Step 2 chưa gọi API, chỉ lưu files
      setDraftGalleryFiles(files);

      setStep(3);
    } catch {
      alert("Lỗi khi thêm ảnh vào gallery. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (timelines) => {
    try {
      setLoading(true);

      // ✅ FIX (Cách 1): Step 3 chưa gọi API, chỉ lưu timelines
      setDraftTimelines(timelines);

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

      // ✅ FIX (Cách 1): Step 4 nhận dates, lưu draft rồi gọi tất cả API
      setDraftDates(dates);

      // ✅ VALIDATE: phải có dữ liệu step1
      if (!draftStep1?.formData) {
        alert("Thiếu dữ liệu Step 1. Vui lòng quay lại và nhập lại.");
        return;
      }

      // 1) Create tour
      const newTour = await createTour(draftStep1.formData);
      console.log("XP-DEBUG-NewTour: ", newTour);

      const tourId = newTour?.tourId; // ✅ FIX: dùng biến cục bộ để tránh setState async
      if (!tourId) {
        alert("Tạo tour thất bại: không nhận được tourId.");
        return;
      }
      setNewTourId(tourId);

      // 2) Link hashtag
      const hashtags = draftStep1.hashtags || [];
      if (hashtags && hashtags.length > 0) {
        for (const tag of hashtags) {
          await linkTourToHashTag({
            tourId, // ✅ FIX: dùng tourId
            hashtagId: tag.hashtagId,
          });
        }
      }

      // 3) Upload gallery
      if (draftGalleryFiles && draftGalleryFiles.length > 0) {
        const formData = new FormData();
        formData.append("tourId", String(tourId));
        // API /createMutipleImage (viết liền) mong đợi key là "files"
        for (const file of draftGalleryFiles) {
          formData.append("files", file);
        }
        const res = await createImages(formData);
        console.log("createImages response:", res);
      }

      // 4) Create timelines
      if (draftTimelines && draftTimelines.length > 0) {
        // Gọi API cho từng mục timeline
        for (const item of draftTimelines) {
          const formData = new FormData();
          formData.append("tourId", String(tourId));
          formData.append("tl_title", item.tl_title);
          formData.append("tl_description", item.tl_description);
          if (item.file) {
            formData.append("file", item.file);
          }
          await createTimeline(formData);
        }
      }

      // 5) Create start dates
      // Gọi API cho từng mục ngày/giá
      for (const item of dates) {
        const dateData = {
          tourId,
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
      handleClose(); // ✅ đóng wizard sau khi thành công
    } catch (err) {
      alert("Lỗi khi thêm ngày khởi hành. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tạo Tour Mới (Bước {step}/4)</DialogTitle>
          {step === 1 && (
            <DialogDescription>
              Thông tin cơ bản về tour của bạn.
            </DialogDescription>
          )}
          {step === 2 && (
            <DialogDescription>Upload Image To Gallery</DialogDescription>
          )}
          {step === 3 && (
            <DialogDescription>
              Chi tiết lịch trình (timeline) cho Tour ID: {newTourId}
            </DialogDescription>
          )}
          {step === 4 && (
            <DialogDescription>
              Ngày khởi hành và giá vé cho Tour ID: {newTourId}
            </DialogDescription>
          )}
        </DialogHeader>

        {step === 1 && (
          <Step1Form
            onSubmit={handleStep1Submit}
            loading={loading}
            initialData={draftStep1Raw}
            onDraftChange={setDraftStep1Raw}
          />
        )}

        {step === 2 && (
          <Step2Form
            onSubmit={handleStep2Submit}
            onBack={() => setStep(1)}
            loading={loading}
            initialFiles={draftGalleryFiles}
            onDraftChange={setDraftGalleryFiles}
          />
        )}

        {step === 3 && (
          <Step3Form
            onSubmit={handleStep3Submit}
            onBack={() => setStep(2)}
            loading={loading}
            initialTimelines={draftTimelines}
            onDraftChange={setDraftTimelines}
          />
        )}

        {step === 4 && (
          <Step4Form
            onSubmit={handleStep4Submit}
            onBack={() => setStep(3)}
            loading={loading}
            initialDates={draftDates}
            onDraftChange={setDraftDates}
            summary={{
              title: draftStep1Raw?.title || "",
              destination: draftStep1Raw?.destination || "",
              thumbnailName: draftStep1Raw?.file?.name || "",
              imagesCount: draftGalleryFiles?.length || 0,
              galleryTotalSize: formatBytes(galleryTotalSizeBytes),
              timelinesCount: draftTimelines?.length || 0,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
