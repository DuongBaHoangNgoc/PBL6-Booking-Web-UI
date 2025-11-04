import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Clock,
  Users,
  Heart,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { getTourById, getReviewsByTourId, getStartDatesByTourId, getTimelineByTourId, getTourPriceById, getImagesByTourId } from "@/api/tours";
import { Dialog, DialogContent } from "@/components/ui/dialog";

function ImageLightbox({ images, startIndex, open, onOpenChange }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Cập nhật index khi mở dialog
  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [startIndex, open]);

  // Hàm điều hướng
  const goToNext = (e) => {
    e.stopPropagation(); // Ngăn dialog đóng
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = (e) => {
    e.stopPropagation(); // Ngăn dialog đóng
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };
  
  const handleThumbnailClick = (e, index) => {
     e.stopPropagation(); // Ngăn dialog đóng
     setCurrentIndex(index);
  }

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] bg-black border-none text-white data-[state=open]:text-white flex flex-col p-4">
        
        {/* Ảnh chính (Full-screen) */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <img 
            src={images[currentIndex].imageURL} 
            alt="Tour full view" 
            className="max-w-full max-h-full object-contain"
          />
          {/* Nút Trái */}
          <Button variant="ghost" size="icon" onClick={goToPrev} className="absolute left-2 md:left-4 h-12 w-12 bg-black/30 hover:bg-black/50 text-white">
            <ChevronLeft className="w-8 h-8" />
          </Button>
          {/* Nút Phải */}
          <Button variant="ghost" size="icon" onClick={goToNext} className="absolute right-2 md:right-4 h-12 w-12 bg-black/30 hover:bg-black/50 text-white">
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Gallery ảnh nhỏ (bên dưới) */}
        <div className="h-24 flex-shrink-0 overflow-x-auto mt-4">
          <div className="flex justify-center gap-2 p-2">
            {images.map((image, index) => (
              <button 
                key={image.imageId} 
                onClick={(e) => handleThumbnailClick(e, index)}
                className={`h-20 w-28 flex-shrink-0 rounded-md overflow-hidden transition-all
                  ${index === currentIndex ? 'ring-2 ring-white' : 'opacity-50 hover:opacity-100'}
                `}
              >
                <img src={image.imageURL} alt="thumb" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TourDetail() {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: 0,
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  useEffect(() => {
    async function fetchTourData() {
      try {
        setLoading(true);

        const tourData = await getTourById(id);
        const priceData = await getTourPriceById(id);
        const timelineData = await getTimelineByTourId(id);
        const reviewData = await getReviewsByTourId(id);
        const startDatesData = await getStartDatesByTourId(id);
        const imagesData = await getImagesByTourId(id);

        const mergedTour = {
          ...tourData,
          price: Number(priceData?.minPriceAdult) || 0,
          originalPrice: Number(priceData?.maxPriceAdult) || 0,
        };

        setTour(mergedTour);
        setTimeline(timelineData);
        setAvailableDates(startDatesData);
        setReviews(reviewData);

        const coverImage = {
          imageId: 'cover',
          imageURL: mergedTour.image
        };

        const galleryImages = Array.isArray(imagesData) ? imagesData : [];

        const filteredGallery = galleryImages.filter(img => img.imageURL !== coverImage.imageURL);

        console.log("DEBUGZZZ: ", imagesData);

        const allImages = [coverImage, ...filteredGallery];

        setImages(allImages);
        setSelectedImage(allImages[0].imageURL);
      } catch (err) {
        console.error("❌ Lỗi khi tải tour:", err);
        setError("Không thể tải dữ liệu tour từ server.");
      } finally {
        setLoading(false);
      }
    }

    fetchTourData();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải chi tiết tour...
      </div>
    );

  if (error || !tour)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Không tìm thấy tour."}
      </div>
    );

  const toggleAll = (expand) => {
    setExpandedDay(expand ? "all" : null);
  };

  // 5. (MỚI) HÀM MỞ LIGHTBOX
  const openLightbox = (index) => {
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };

  return (
    <section className="p-6 md:p-14">
      <div className="container mx-auto px-4">
        {/* Ảnh chính */}
        <div className="mb-4 rounded-lg overflow-hidden h-96 bg-muted relative group cursor-pointer">
          <img
            src={selectedImage} 
            alt={tour.title}
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ (overlay) để mở lightbox */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              const mainIndex = images.findIndex(img => img.imageURL === selectedImage);
              openLightbox(mainIndex >= 0 ? mainIndex : 0);
            }}
          >
            <span className="text-white font-semibold text-lg border-2 border-white rounded-lg px-4 py-2">
              Phóng to ảnh
            </span>
          </div>
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-4 mb-8">
            {images.slice(0, 5).map((image, index) => ( // Giới hạn 5 ảnh
              <button
                key={image.imageId}
                onClick={() =>  {
                  setSelectedImage(image.imageURL); 
                  openLightbox(index);
                  }
                }
                className={`rounded-lg overflow-hidden h-24 transition-all duration-200
                  ${selectedImage === image.imageURL 
                    ? 'ring-4 ring-primary ring-offset-2' 
                    : 'opacity-70 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={image.imageURL}
                  alt="Tour thumbnail"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Nội dung chính */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                {tour.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>{tour.destination}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                {/* ⭐ Hiển thị sao */}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(tour.starAvg || 0)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* 🔢 Hiển thị điểm trung bình & số đánh giá */}
                <span className="font-semibold text-foreground">
                  {Number(tour.starAvg || 0).toFixed(1)}
                </span>

                {tour.reviewCount && (
                  <span className="text-sm text-muted-foreground">
                    ({tour.reviewCount} reviews)
                  </span>
                )}
              </div>

              <p className="text-lg text-muted-foreground whitespace-pre-line">
                {tour.description || "Không có mô tả cho tour này."}
              </p>
            </div>

            {/* Tour bao gồm */}
            {tour.highlight && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Tour bao gồm
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tour.highlight
                    .split("\n")
                    .filter((line) => line.trim() !== "")
                    .map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">
                          {item.replace(/^-/, "").trim()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chương trình tour */}
            {timeline.length > 0 && (
              <div id="tour-schedule">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-foreground">
                    Chương trình tour
                  </h2>
                  <div className="flex gap-4 text-primary cursor-pointer">
                    <span onClick={() => toggleAll(true)}>Xem tất cả</span>
                    <span onClick={() => toggleAll(false)}>Thu gọn</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <Card key={item.timeLineId} className="overflow-hidden">
                      <div
                        className="flex justify-between items-center cursor-pointer p-4 bg-muted hover:bg-muted/50 transition"
                        onClick={() =>
                          setExpandedDay(expandedDay === index ? null : index)
                        }
                      >
                        <div className="flex items-center gap-4">
                          {item.imageTimeLine && (
                            <img
                              src={item.imageTimeLine}
                              alt={item.tl_title}
                              className="w-20 h-16 object-cover rounded-md"
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg text-foreground">
                              {item.tl_title}
                            </h3>
                          </div>
                        </div>
                        {expandedDay === index || expandedDay === "all" ? (
                          <ChevronUp className="w-5 h-5 text-primary" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-primary" />
                        )}
                      </div>

                      {(expandedDay === index || expandedDay === "all") && (
                        <div className="p-4 border-t border-border">
                          <p
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{
                              __html: item.tl_description,
                            }}
                          />
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {/* Đánh giá & Nhận xét */}
            {reviews.length > 0 && (
              <div id="reviews-section">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Đánh giá & Nhận xét ({reviews.length})
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.reviewId} className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-foreground">
                            {review.userName || "Người dùng ẩn danh"}
                          </h3>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {review.comment || "Không có nội dung đánh giá."}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar đặt tour */}
          <div>
            <Card className="p-6 sticky top-20 space-y-6">
              {/* 💰 Giá tour */}
              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-primary">
                    {tour.price.toLocaleString("vi-VN")}₫
                  </span>
                  {tour.originalPrice > 0 && (
                    <span className="text-lg text-muted-foreground line-through">
                      {tour.originalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  )}
                </div>
              </div>

              {/* 🗓️ Lịch khởi hành */}
              <div className="space-y-3 pb-6 border-b border-border">
                <label className="text-sm font-medium text-foreground block">
                  Chọn Lịch Trình và Xem Giá:
                </label>

                {/* 3 ngày gần nhất + ngày được chọn + Tất cả */}
                <div className="flex flex-wrap gap-3">
                  {[
                    ...availableDates
                      .filter((d) => new Date(d.startDate) >= new Date())
                      .sort(
                        (a, b) => new Date(a.startDate) - new Date(b.startDate)
                      )
                      .slice(0, 3),
                    // 👇 nếu ngày chọn từ lịch không có trong 3 ngày gần nhất, thêm vào
                    ...availableDates.filter((d) => {
                      const formatted = new Date(
                        d.startDate
                      ).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      });
                      return formatted === selectedDate;
                    }),
                  ]
                    // loại trùng ngày (nếu có)
                    .filter(
                      (v, i, self) =>
                        i ===
                        self.findIndex(
                          (x) =>
                            new Date(x.startDate).toDateString() ===
                            new Date(v.startDate).toDateString()
                        )
                    )
                    .map((d) => {
                      const date = new Date(d.startDate);
                      const formatted = date.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      });

                      return (
                        <button
                          key={d.dateId}
                          onClick={() => {
                            setSelectedDate(formatted);
                            setTour((prev) => ({
                              ...prev,
                              price: Number(d.priceAdult),
                            }));
                          }}
                          className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                            selectedDate === formatted
                              ? "border-primary text-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div>{formatted}</div>
                          <div className="text-xs text-muted-foreground">
                            {(Number(d.priceAdult) / 1000).toFixed(0)}k
                          </div>
                        </button>
                      );
                    })}

                  {/* Nút mở DatePicker */}
                  <button
                    onClick={() =>
                      setSelectedDate((prev) =>
                        prev === "datepicker" ? "" : "datepicker"
                      )
                    }
                    className={`px-4 py-2 rounded-lg border flex items-center justify-center gap-1 transition ${
                      selectedDate === "datepicker"
                        ? "border-primary text-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10m-9 6h4m-8 4h12a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Tất cả</span>
                  </button>
                </div>

                {/* 🗓️ DatePicker chỉ hiển thị khi bấm “Tất cả” */}
                {selectedDate === "datepicker" && (
                  <div className="mt-3 border border-border rounded-lg p-3 bg-background">
                    <DayPicker
                      mode="single"
                      onSelect={(date) => {
                        if (date) {
                          const formatted = date.toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                          });

                          const selectedTourDate = availableDates.find(
                            (d) =>
                              new Date(d.startDate).toDateString() ===
                              date.toDateString()
                          );

                          if (selectedTourDate) {
                            setSelectedDate(formatted);
                            setTour((prev) => ({
                              ...prev,
                              price: Number(selectedTourDate.priceAdult),
                            }));
                          }

                          // Ẩn lịch sau khi chọn
                          setTimeout(() => setSelectedDate(formatted), 200);
                        }
                      }}
                      disabled={(date) =>
                        !availableDates.some(
                          (d) =>
                            new Date(d.startDate).toDateString() ===
                            date.toDateString()
                        )
                      }
                      modifiers={{
                        available: availableDates.map(
                          (d) => new Date(d.startDate)
                        ),
                      }}
                      modifiersStyles={{
                        available: { color: "#16a34a", fontWeight: "bold" },
                      }}
                    />

                    <p className="text-xs text-muted-foreground mt-2 italic text-center">
                      * Chỉ có thể chọn những ngày có tour khởi hành
                    </p>
                  </div>
                )}
              </div>

              {/* 👨‍👩‍👧 Số lượng khách */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-foreground block mb-2">
                  Chọn số lượng khách
                </label>

                {/* Người lớn */}
                <div className="flex items-center justify-between border border-border rounded-lg p-2 mb-2">
                  <div>
                    <p className="font-medium text-foreground">Người lớn</p>
                    <p className="text-xs text-muted-foreground">&gt; 9 tuổi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        setTravelers((prev) => ({
                          ...prev,
                          adults: Math.max(prev.adults - 1, 0),
                        }))
                      }
                    >
                      –
                    </Button>
                    <span className="w-6 text-center">{travelers.adults}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        setTravelers((prev) => ({
                          ...prev,
                          adults: prev.adults + 1,
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Trẻ em */}
                <div className="flex items-center justify-between border border-border rounded-lg p-2">
                  <div>
                    <p className="font-medium text-foreground">Trẻ em</p>
                    <p className="text-xs text-muted-foreground">5 - 9 tuổi</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        setTravelers((prev) => ({
                          ...prev,
                          children: Math.max(prev.children - 1, 0),
                        }))
                      }
                    >
                      –
                    </Button>
                    <span className="w-6 text-center">
                      {travelers.children}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="w-8 h-8"
                      onClick={() =>
                        setTravelers((prev) => ({
                          ...prev,
                          children: prev.children + 1,
                        }))
                      }
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* Tổng giá */}
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Tổng giá</p>
                  <p className="text-2xl font-bold text-primary">
                    {(
                      tour.price * travelers.adults +
                      tour.price * 0.7 * travelers.children
                    ).toLocaleString("vi-VN")}
                    ₫
                  </p>
                </div>

                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg">
                  Đặt ngay
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <ImageLightbox 
        images={images}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />
    </section>
  );
}
