"use client";
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
import { useAuth } from "@/context/useAuth";
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

// ================== Helpers ==================
const formatHashtag = (text) => {
  const cleaned = text.replace(/#/g, "").trim();
  if (!cleaned) return null;

  const slug = slugify(cleaned, {
    lower: true,
    strict: true,
    locale: "vi",
  });

  const formatted = slug.replace(/-/g, "");
  return `#${formatted}`;
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

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

// ================== Hashtag Combobox ==================
function HashtagCombobox({ value, onChange }) {
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

      try {
        const tags = await filterHashtags(params);
        setAvailableHashtags(tags?.hashtags || []);
      } catch (e) {
        setAvailableHashtags([]);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchTags, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelect = (tag) => {
    if (!value.find((item) => item.hashtagId === tag.hashtagId)) {
      onChange([...value, tag]);
    }
    setSearchQuery("");
    setOpen(false);
  };

  const handleCreate = async () => {
    const formattedName = formatHashtag(searchQuery);
    if (!formattedName) return;

    if (value.some((tag) => tag.name === formattedName)) {
      setSearchQuery("");
      setOpen(false);
      return;
    }

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
      handleSelect(newTag);
    } catch (err) {
      alert("Lỗi khi tạo tag mới.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnselect = (tagToRemove) => {
    onChange(value.filter((tag) => tag.hashtagId !== tagToRemove.hashtagId));
  };

  // ✅ FIX IME: Không chặn Space. Enter chỉ xử lý khi KHÔNG isComposing
  const handleKeyDown = (e) => {
    if (e.isComposing) return; // đang gõ tiếng Việt/IME thì bỏ qua
    if (e.key === "Enter") {
      e.preventDefault();
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
            className="w-full justify-between h-auto min-h-[40px]"
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
                    e.stopPropagation();
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
                      className={`mr-2 h-4 w-4 ${value.some((item) => item.hashtagId === tag.hashtagId)
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
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    initialData || {
      title: "",
      destination: "",
      days: "3",
      nights: "2",
      quantity: 30,
      description: "",
      highlight: "",
      file: null,
      hashtags: [],
    }
  );

  // ✅ tránh loop hydrate
  const isHydratingRef = useRef(false);

  // ✅ FIX IME: đang gõ tiếng Việt (composition) thì không sync draft lên parent
  const isComposingRef = useRef(false);

  // ✅ debounce sync để parent không re-render mỗi phím
  const draftTimerRef = useRef(null);

  useEffect(() => {
    if (!initialData) return;

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

    // enforce rule days = nights + 1
    const d = Number(initialData.days) || 3;
    const n = Number(initialData.nights) || 2;
    let days = d;
    let nights = n;

    if (days !== nights + 1) {
      nights = Math.max(1, nights);
      days = nights + 1;
    }
    if (days < 2) days = 2;
    if (nights < 1) nights = 1;

    setFormData({
      ...initialData,
      days: String(days),
      nights: String(nights),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // ✅ FIX IME + debounce: sync local -> Wizard sau render
  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }

    // đang gõ tiếng Việt thì không sync
    if (isComposingRef.current) return;

    if (!onDraftChange) return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      onDraftChange(formData);
    }, 250);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [formData, onDraftChange]);

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // chặn nhập tay cho days/nights
  const preventManualInput = (e) => e.preventDefault();
  const handleDaysNightsKeyDown = (e) => {
    if (e.key === "Tab") return;
    e.preventDefault();
  };

  const setDays = (nextDays) => {
    const daysNum = clamp(Number(nextDays) || 2, 2, 365);
    const nightsNum = clamp(daysNum - 1, 1, 364);
    setFormData((prev) => ({
      ...prev,
      days: String(daysNum),
      nights: String(nightsNum),
    }));
  };

  const setNights = (nextNights) => {
    const nightsNum = clamp(Number(nextNights) || 1, 1, 364);
    const daysNum = clamp(nightsNum + 1, 2, 365);
    setFormData((prev) => ({
      ...prev,
      nights: String(nightsNum),
      days: String(daysNum),
    }));
  };

  // ✅ FIX IME: bắt sự kiện composition cho các input text/textarea
  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };
  const handleCompositionEnd = () => {
    isComposingRef.current = false;
    // kết thúc composing thì sync ngay (không chờ debounce lâu)
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    onDraftChange?.(formData);
  };

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

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (file && !validTypes.includes(file.type)) {
        alert("Ảnh đại diện chỉ chấp nhận JPG/PNG/WEBP.");
        e.target.value = "";
        return;
      }

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

    if (!formData.title.trim()) return alert("Vui lòng nhập tên tour.");
    if (!formData.destination.trim()) return alert("Vui lòng nhập điểm đến.");

    const daysNum = Number(formData.days);
    const nightsNum = Number(formData.nights);
    const quantityNum = Number(formData.quantity);

    if (!Number.isFinite(daysNum) || daysNum <= 0)
      return alert("Số ngày phải > 0.");
    if (!Number.isFinite(nightsNum) || nightsNum <= 0)
      return alert("Số đêm phải > 0.");
    if (daysNum !== nightsNum + 1)
      return alert("Thời gian không hợp lệ: Ngày phải bằng Đêm + 1.");

    if (!Number.isFinite(quantityNum) || quantityNum <= 0)
      return alert("Số lượng chỗ phải > 0.");

    if (!formData.description.trim())
      return alert("Vui lòng nhập mô tả chi tiết.");

    if (!formData.highlight.trim())
      return alert("Vui lòng nhập phần 'Tour bao gồm'.");

    if (!formData.file) return alert("Vui lòng chọn ảnh đại diện cho tour.");

    const timeString = `${daysNum} ngày ${nightsNum} đêm`;

    const apiFormData = new FormData();
    apiFormData.append("title", formData.title.trim());
    apiFormData.append("destination", formData.destination.trim());
    apiFormData.append("time", timeString);
    apiFormData.append("quantity", String(quantityNum));
    apiFormData.append("highlight", formData.highlight);
    apiFormData.append("description", formData.description);
    apiFormData.append("file", formData.file);
    apiFormData.append("userId", String(user.userId));

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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
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
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Thời gian</Label>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Days */}
            <div className="flex items-center gap-2">
              <Input
                name="days"
                type="number"
                min="2"
                max="365"
                value={formData.days}
                readOnly
                inputMode="none"
                onKeyDown={handleDaysNightsKeyDown}
                onPaste={preventManualInput}
                onDrop={preventManualInput}
                onBeforeInput={preventManualInput}
                className="w-20"
              />
              <span>ngày</span>

              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 px-2"
                  onClick={() => setDays(Number(formData.days) + 1)}
                >
                  ▲
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 px-2"
                  onClick={() => setDays(Number(formData.days) - 1)}
                  disabled={Number(formData.days) <= 2}
                >
                  ▼
                </Button>
              </div>
            </div>

            {/* Nights */}
            <div className="flex items-center gap-2">
              <Input
                name="nights"
                type="number"
                min="1"
                max="364"
                value={formData.nights}
                readOnly
                inputMode="none"
                onKeyDown={handleDaysNightsKeyDown}
                onPaste={preventManualInput}
                onDrop={preventManualInput}
                onBeforeInput={preventManualInput}
                className="w-20"
              />
              <span>đêm</span>

              <div className="flex flex-col">
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 px-2"
                  onClick={() => setNights(Number(formData.nights) + 1)}
                >
                  ▲
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-6 px-2"
                  onClick={() => setNights(Number(formData.nights) - 1)}
                  disabled={Number(formData.nights) <= 1}
                >
                  ▼
                </Button>
              </div>
            </div>
          </div>
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
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
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
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
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

// ================== Step 2 ==================
function Step2Form({
  onSubmit,
  onBack,
  loading,
  initialFiles = [],
  onDraftChange,
}) {
  const [files, setFiles] = useState(initialFiles);

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

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      const invalid = selectedFiles.find((f) => !validTypes.includes(f.type));
      if (invalid) {
        alert("Gallery chỉ chấp nhận ảnh JPG/PNG/WEBP.");
        e.target.value = "";
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      const tooBig = selectedFiles.find((f) => f.size > maxSize);
      if (tooBig) {
        alert("Có ảnh > 5MB. Vui lòng chọn ảnh nhỏ hơn.");
        e.target.value = "";
        return;
      }

      setFiles(selectedFiles);
      onDraftChange?.(selectedFiles);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return alert("Vui lòng chọn ít nhất một ảnh.");
    onSubmit(files);
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
              onDraftChange?.([]);
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

// ================== Step 3 ==================
// ✅ FIX LOOP: chỉ sync theo totalDays (và lần đầu mount), không sync theo initialTimelines mỗi lần props đổi
function Step3Form({
  onSubmit,
  onBack,
  loading,
  initialTimelines,
  onDraftChange,
  totalDays,
}) {
  const days = clamp(Number(totalDays) || 1, 1, 365);

  const isHydratingRef = useRef(false);
  const initializedRef = useRef(false);

  const normalizeTimelines = (base, targetDays) => {
    const src = Array.isArray(base) ? base : [];
    const next = [];
    for (let i = 0; i < targetDays; i++) {
      const prev = src[i];
      next.push({
        tl_title: prev?.tl_title?.trim() ? prev.tl_title : `Ngày ${i + 1}`,
        tl_description: prev?.tl_description || "",
        file: prev?.file || null,
      });
    }
    return next;
  };

  const [timelines, setTimelines] = useState(() =>
    normalizeTimelines(initialTimelines, days)
  );

  // ✅ mount: chỉ init 1 lần từ initialTimelines
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    isHydratingRef.current = true;
    setTimelines(normalizeTimelines(initialTimelines, days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ khi days thay đổi: resize timelines (giữ data theo index)
  useEffect(() => {
    isHydratingRef.current = true;
    setTimelines((prev) => normalizeTimelines(prev, days));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  // ✅ chỉ push draft khi user thực sự thay đổi (không push lúc hydrate)
  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }
    onDraftChange?.(timelines);
  }, [timelines, onDraftChange]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    setTimelines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [name]: value };
      return next;
    });
  };

  const handleFileChange = (index, e) => {
    if (e.target.files) {
      const file = e.target.files[0];

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
        next[index] = { ...next[index], file: file || null };
        return next;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

    onSubmit(timelines);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[60vh] overflow-y-auto pr-2"
    >
      {timelines.map((item, index) => (
        <div key={index} className="space-y-2 border p-4 rounded-lg">
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
        </div>
      ))}

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

// ================== Step 4 ==================
// startDate => auto endDate = startDate + days
function Step4Form({
  onSubmit,
  onBack,
  loading,
  initialDates,
  onDraftChange,
  summary,
  totalDays,
}) {
  const daysNum = clamp(Number(totalDays) || 1, 1, 365);
  const minStartDate = useMemo(() => todayISO(), []);

  const isHydratingRef = useRef(false);

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

  useEffect(() => {
    if (!initialDates?.length) return;
    // tránh set lại nếu giống (đỡ loop)
    const same = JSON.stringify(initialDates) === JSON.stringify(dates);
    if (same) return;

    isHydratingRef.current = true;
    setDates(initialDates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDates]);

  useEffect(() => {
    if (isHydratingRef.current) {
      isHydratingRef.current = false;
      return;
    }
    onDraftChange?.(dates);
  }, [dates, onDraftChange]);

  const handleChange = (index, e) => {
    const { name, value } = e.target;

    setDates((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [name]: value };

      if (name === "startDate") {
        next[index].endDate = addDaysISO(value, daysNum);
      }

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
                min={minStartDate}
                onChange={(e) => handleChange(index, e)}
                required
              />
            </div>
            <div>
              <Label>Ngày về (tự động)</Label>
              <Input
                name="endDate"
                type="date"
                value={item.endDate}
                readOnly
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
            disabled={dates.length === 1}
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

// ================== Wizard ==================
export function CreateTourWizard({ open, onOpenChange, onSuccess }) {
  const [step, setStep] = useState(1);
  const [newTourId, setNewTourId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [draftStep1Raw, setDraftStep1Raw] = useState(null);
  const [draftStep1, setDraftStep1] = useState(null);
  const [draftGalleryFiles, setDraftGalleryFiles] = useState([]);
  const [draftTimelines, setDraftTimelines] = useState([]);
  const [draftDates, setDraftDates] = useState([]);

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

  const totalDays = useMemo(() => {
    const d = Number(draftStep1Raw?.days);
    return Number.isFinite(d) && d > 0 ? d : 3;
  }, [draftStep1Raw?.days]);

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setNewTourId(null);
      setLoading(false);

      setDraftStep1Raw(null);
      setDraftStep1(null);
      setDraftGalleryFiles([]);
      setDraftTimelines([]);
      setDraftDates([]);
    }, 300);
  };

  const handleDialogOpenChange = (nextOpen) => {
    if (!nextOpen) handleClose();
    else onOpenChange(true);
  };

  const handleStep1Submit = async (formData, hashtags) => {
    try {
      setLoading(true);
      setDraftStep1({ formData, hashtags });
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
      setDraftDates(dates);

      if (!draftStep1?.formData) {
        alert("Thiếu dữ liệu Step 1. Vui lòng quay lại và nhập lại.");
        return;
      }

      const newTour = await createTour(draftStep1.formData);
      const tourId = newTour?.tourId;
      if (!tourId) {
        alert("Tạo tour thất bại: không nhận được tourId.");
        return;
      }
      setNewTourId(tourId);

      const hashtags = draftStep1.hashtags || [];
      if (hashtags.length > 0) {
        for (const tag of hashtags) {
          await linkTourToHashTag({
            tourId,
            hashtagId: tag.hashtagId,
          });
        }
      }

      if (draftGalleryFiles.length > 0) {
        const formData = new FormData();
        formData.append("tourId", String(tourId));
        for (const file of draftGalleryFiles) formData.append("files", file);
        await createImages(formData);
      }

      if (draftTimelines.length > 0) {
        for (const item of draftTimelines) {
          const formData = new FormData();
          formData.append("tourId", String(tourId));
          formData.append("tl_title", item.tl_title);
          formData.append("tl_description", item.tl_description);
          if (item.file) formData.append("file", item.file);
          await createTimeline(formData);
        }
      }

      for (const item of dates) {
        const dateData = {
          tourId,
          startDate: item.startDate,
          endDate: item.endDate,
          priceAdult: Number(item.priceAdult),
          priceChildren: Number(item.priceChildren),
          quantity: Number(item.quantity),
          availability: 1,
        };
        await createStartDate(dateData);
      }

      alert("Tạo tour thành công!");
      onSuccess();
      handleClose();
    } catch (err) {
      alert("Lỗi khi thêm ngày khởi hành. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        className="max-w-3xl"
        onInteractOutside={(e) => e.preventDefault()} // ✅ click ngoài không đóng
        onEscapeKeyDown={(e) => e.preventDefault()} // ✅ ESC không đóng
      >
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
            totalDays={totalDays}
          />
        )}

        {step === 4 && (
          <Step4Form
            onSubmit={handleStep4Submit}
            onBack={() => setStep(3)}
            loading={loading}
            initialDates={draftDates}
            onDraftChange={setDraftDates}
            totalDays={totalDays}
            summary={{
              title: draftStep1Raw?.title || "",
              destination: draftStep1Raw?.destination || "",
              thumbnailName: draftStep1Raw?.file?.name || "",
              imagesCount: draftGalleryFiles?.length || 0,
              galleryTotalSize: formatBytes(galleryTotalSizeBytes),
              timelinesCount: Number(totalDays) || 0,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
