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
  Phone,
  Tag,
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Info
} from "lucide-react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  getTourById,
  getReviewsByTourId,
  getStartDatesByTourId,
  getTimelineByTourId,
  getTourPriceById,
  getImagesByTourId,
  filterTours,
} from "@/api/tours";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useAuth } from "@/context/useAuth";
import { createBooking } from "@/api/bookings";
import { getHashtagsForTour } from "@/api/hashtags";
import { Badge } from "@/components/ui/badge";
import TourCard from "@/components/pages/tours/TourCard";
import { addToFavorites, getFavorites, deleteFavorite } from "@/api/favourites";

// Component Lightbox (Giữ nguyên logic)
function ImageLightbox({ images, startIndex, open, onOpenChange }) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  useEffect(() => {
    if (open) {
      setCurrentIndex(startIndex);
    }
  }, [startIndex, open]);

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleThumbnailClick = (e, index) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  if (!images || images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] bg-black/95 border-none text-white p-0 overflow-hidden flex flex-col">
        <div className="absolute top-4 right-4 z-50">
           <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white hover:bg-white/10">
             <X className="w-6 h-6" />
           </Button>
        </div>
        
        {/* Ảnh chính */}
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <img
            src={images[currentIndex].imageURL}
            alt="Tour full view"
            className="max-w-full max-h-full object-contain"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrev}
            className="absolute left-4 h-12 w-12 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-4 h-12 w-12 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-sm"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </div>

        {/* Thumbnails */}
        <div className="h-20 bg-black/50 flex items-center justify-center gap-2 p-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.imageId}
                onClick={(e) => handleThumbnailClick(e, index)}
                className={`h-16 w-24 flex-shrink-0 rounded-md overflow-hidden transition-all border-2
                  ${
                    index === currentIndex
                      ? "border-cyan-500 opacity-100"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }
                `}
              >
                <img
                  src={image.imageURL}
                  alt="thumb"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // State
  const [tour, setTour] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [expandedDay, setExpandedDay] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [hashtags, setHashtags] = useState({ tourHashtags: [] }); 
  const [relativeTour, setRelativeTour] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);

  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState(null);
  const [travelers, setTravelers] = useState({ adults: 2, children: 0 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStartIndex, setLightboxStartIndex] = useState(0);

  // 🧾 Thông tin form đặt tour
  const [openBookingForm, setOpenBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    voucher: "",
  });

  // HÀM TÍNH TỔNG TIỀN (Đã thêm mới để fix lỗi trắng màn hình)
  const calculateTotalPrice = () => {
    if (!selectedDate || typeof selectedDate === 'string') return 0;
    return (
      (selectedDate.priceAdult || 0) * travelers.adults +
      (selectedDate.priceChildren || 0) * travelers.children
    );
  };

  useEffect(() => {
    async function fetchTourData() {
      try {
        setLoading(true);

        const [
          tourData,
          priceData,
          timelineData,
          reviewData,
          startDatesData,
          imagesData,
          hashtagData,
        ] = await Promise.all([
          getTourById(id),
          getTourPriceById(id),
          getTimelineByTourId(id),
          getReviewsByTourId(id),
          getStartDatesByTourId(id),
          getImagesByTourId(id),
          getHashtagsForTour(id),
        ]);

        const mergedTour = {
          ...tourData,
          price: Number(priceData?.minPriceAdult) || 0,
          originalPrice: Number(priceData?.maxPriceAdult) || 0,
        };

        const relativeParams = {
          page: 1,
          limit: 4,
          destination: mergedTour.destination,
        };
        const relativeTourData = await filterTours(relativeParams);
        setRelativeTour(relativeTourData);

        setTour(mergedTour);
        setTimeline(timelineData);
        setAvailableDates(startDatesData);
        setReviews(reviewData);
        // Safeguard cho hashtags tránh lỗi undefined
        setHashtags(hashtagData || { tourHashtags: [] });

        const coverImage = { imageId: "cover", imageURL: mergedTour.image };
        const galleryImages = Array.isArray(imagesData) ? imagesData : [];
        const filteredGallery = galleryImages.filter(
          (img) => img.imageURL !== coverImage.imageURL
        );
        const allImages = [coverImage, ...filteredGallery];

        setImages(allImages);
        setSelectedImage(allImages[0]?.imageURL || "");

        // 💖 Kiểm tra xem tour có trong danh sách yêu thích không
        if (user) {
          try {
            const favRes = await getFavorites(user.userId, 1, 100);
            const favList = favRes?.data?.favourites || [];
            const favItem = favList.find((f) => f.tour?.tourId === Number(id));

            if (favItem) {
              setIsFavorite(true);
              setFavoriteId(favItem.favouriteId);
            } else {
              setIsFavorite(false);
              setFavoriteId(null);
            }
          } catch (favErr) {
            console.warn("⚠️ Lỗi khi kiểm tra yêu thích:", favErr);
          }
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu tour:", err);
        setError("Không thể tải dữ liệu tour từ server.");
      } finally {
        setLoading(false);
      }
    }
    fetchTourData();
  }, [id, user]);

  const handleBookNow = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để đặt tour.");
      navigate("/auth/login", { state: { from: location } });
      return;
    }
    if (!selectedDate || selectedDate === "datepicker") {
      alert("Vui lòng chọn ngày khởi hành.");
      return;
    }
    if (travelers.adults === 0) {
      alert("Vui lòng chọn ít nhất 1 người lớn.");
      return;
    }

    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      voucher: "",
    });
    setOpenBookingForm(true);
  };

  const handleConfirmBooking = async () => {
    setIsBooking(true);
    try {
      const bookingData = {
        tourId: tour.tourId,
        userId: user.userId,
        dateId: selectedDate.dateId,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        numAdults: travelers.adults,
        numChildren: travelers.children,
        codeCoupon: formData.voucher || "",
        bookingStatus: "pending",
        receiveEmail: true,
      };
      await createBooking(bookingData);
      alert("Đặt tour thành công! Đang chuyển đến trang booking của bạn...");
      navigate("/bookings");
    } catch (err) {
      console.error("❌ Lỗi khi đặt tour:", err);
      alert("Đã xảy ra lỗi khi đặt tour. Vui lòng thử lại.");
    } finally {
      setIsBooking(false);
      setOpenBookingForm(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      alert("Bạn cần đăng nhập để thêm vào yêu thích.");
      navigate("/auth/login", { state: { from: location } });
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        await deleteFavorite(favoriteId);
        setIsFavorite(false);
        setFavoriteId(null);
        alert("🖤 Đã xóa khỏi danh sách yêu thích!");
      } else {
        const res = await addToFavorites(user.userId, tour.tourId);
        setIsFavorite(true);
        setFavoriteId(res?.data?.favouriteId || null);
        alert("💖 Đã thêm vào danh sách yêu thích!");
      }
    } catch (err) {
      console.error("❌ Lỗi khi thao tác yêu thích:", err);
      alert("Không thể thực hiện thao tác yêu thích. Vui lòng thử lại.");
    }
  };

  const toggleAll = (expand) => {
    setExpandedDay(expand ? "all" : null);
  };

  const openLightbox = (index) => {
    setLightboxStartIndex(index);
    setLightboxOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3 text-cyan-600">
          <div className="w-10 h-10 border-4 border-cyan-200 border-t-cyan-600 rounded-full animate-spin"></div>
          <span className="font-medium animate-pulse">Đang tải thông tin tour...</span>
        </div>
      </div>
    );
  }

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Không tìm thấy tour</h2>
          <Button onClick={() => navigate("/tours")} variant="outline" className="mt-4">
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      
      {/* ================= HERO SECTION ================= */}
      <div className="relative pt-24 pb-32 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="max-w-5xl">
            <Link to="/tours" className="inline-flex items-center gap-1 text-blue-100 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/30 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {tour.destination}
              </span>
              <div className="bg-yellow-400/90 text-yellow-950 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                <Star className="w-3 h-3 fill-current" /> {Number(tour.starAvg || 0).toFixed(1)} 
                <span className="font-normal opacity-80 ml-1">({tour.reviewCount || 0} đánh giá)</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight drop-shadow-md text-balance">
              {tour.title}
            </h1>

            {hashtags.tourHashtags && hashtags.tourHashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {hashtags.tourHashtags.map((item) => (
                  <Link key={item.tourHashTagId} to={`/hashtags/${item.hashtag.name.replace("#", "")}`}>
                    <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-none px-3 py-1 text-sm font-medium backdrop-blur-sm">
                      #{item.hashtag.name.replace("#", "")}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="container mx-auto px-4 md:px-6 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              {/* ================= GALLERY SECTION (UPDATED) ================= */}
              {/* Đây là phần bạn yêu cầu bổ sung lại */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-2">
                
                {/* Ảnh chính lớn */}
                <div 
                  className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group cursor-pointer bg-slate-100"
                  onClick={() => {
                    // Khi click vào ảnh lớn thì mở lightbox
                    const idx = images.findIndex(img => img.imageURL === selectedImage);
                    openLightbox(idx >= 0 ? idx : 0);
                  }}
                >
                  <img
                    key={selectedImage} // Key giúp trigger animation khi đổi ảnh
                    src={selectedImage || "/placeholder.svg"}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 animate-in fade-in zoom-in-50 duration-300"
                  />
                  
                  {/* Nút Favorite nằm trên ảnh */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Ngăn sự kiện nổi bọt
                      handleToggleFavorite();
                    }}
                    className="absolute top-4 right-4 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg transition-all duration-300 hover:bg-white hover:scale-110 group/fav"
                    title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  >
                    <Heart
                      className={`w-6 h-6 transition-colors duration-300 ${
                        isFavorite
                          ? "fill-pink-500 text-pink-500"
                          : "text-white group-hover/fav:text-pink-500"
                      }`}
                    />
                  </button>

                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                     <div className="bg-white/30 backdrop-blur-md border border-white/50 text-white px-5 py-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 font-bold flex items-center gap-2 shadow-lg">
                       <ImageIcon className="w-5 h-5" /> Xem toàn bộ ảnh ({images.length})
                     </div>
                  </div>
                </div>
                
                {/* Danh sách Thumbnails */}
                {images.length > 1 && (
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {images.slice(0, 5).map((image, index) => (
                      <button 
                        key={image.imageId || index}
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn sự kiện nổi bọt
                          setSelectedImage(image.imageURL); // Cập nhật ảnh chính
                        }}
                        className={`h-20 md:h-24 rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group/thumb
                          ${selectedImage === image.imageURL 
                            ? 'border-cyan-500 ring-2 ring-cyan-100 ring-offset-1 opacity-100' 
                            : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                      >
                        <img 
                          src={image.imageURL} 
                          alt={`Thumbnail ${index + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-110" 
                        />
                        {/* Overlay mờ cho ảnh chưa chọn */}
                        {selectedImage !== image.imageURL && (
                          <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* ================= END GALLERY SECTION ================= */}

            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Info className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Tổng quan Tour</h3>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                {tour.description || "Chưa có mô tả chi tiết."}
              </p>
            </div>

            {/* Highlights */}
            {tour.highlight && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Dịch vụ bao gồm</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tour.highlight.split("\n").filter(l => l.trim()).map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <span className="text-slate-700 text-sm font-medium">{item.replace(/^-/, "").trim()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <CalendarIcon className="text-cyan-500" /> Lịch trình chi tiết
                  </h3>
                  <div className="flex gap-3 text-sm font-medium">
                    <button onClick={() => toggleAll(true)} className="text-cyan-600 hover:bg-cyan-50 px-3 py-1 rounded-full transition-colors">Mở tất cả</button>
                    <button onClick={() => toggleAll(false)} className="text-slate-500 hover:bg-slate-100 px-3 py-1 rounded-full transition-colors">Thu gọn</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {timeline.map((item, index) => (
                    <div key={item.timeLineId} className="border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-cyan-200">
                      <div
                        className="flex justify-between items-center cursor-pointer p-4 bg-slate-50 hover:bg-white transition-colors"
                        onClick={() => setExpandedDay(expandedDay === index ? null : index)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800">{item.tl_title}</h4>
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">Nhấn để xem chi tiết</p>
                          </div>
                        </div>
                        {expandedDay === index || expandedDay === "all" ? <ChevronUp className="text-cyan-500" /> : <ChevronDown className="text-slate-400" />}
                      </div>

                      {(expandedDay === index || expandedDay === "all") && (
                        <div className="p-5 border-t border-slate-100 bg-white">
                          <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: item.tl_description }} />
                          {item.imageTimeLine && (
                            <img src={item.imageTimeLine} alt="Timeline" className="mt-4 rounded-xl w-full h-64 object-cover" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Đánh giá từ khách hàng ({reviews.length})</h3>
                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="flex gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                        <img 
                          src={review.user?.avatar || `https://ui-avatars.com/api/?name=${review.user?.fullName}&background=random`} 
                          alt="user" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-slate-900">{review.user?.fullName || "Ẩn danh"}</h4>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(review.timestamp), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                        <div className="flex text-yellow-400 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-slate-200 fill-slate-200"}`} />
                          ))}
                        </div>
                        <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-xl rounded-tl-none">{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Booking Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              
              {/* BOOKING CARD */}
              <div className="bg-white rounded-3xl shadow-xl shadow-cyan-900/5 border border-slate-100 p-6 overflow-hidden relative">                
                <div className="mb-6">
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wider">Giá khởi điểm</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold text-blue-600">
                      {(selectedDate?.priceAdult || tour.price || 0).toLocaleString("vi-VN")}₫
                    </span>
                    {tour.originalPrice > (selectedDate?.priceAdult || tour.price) && (
                      <span className="text-sm text-slate-400 line-through decoration-slate-400">
                        {tour.originalPrice.toLocaleString("vi-VN")}₫
                      </span>
                    )}
                  </div>
                </div>

                {/* Date Selection Grid */}
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-3">Lịch khởi hành</label>
                  <div className="flex flex-wrap gap-2">
                    {availableDates
                      .filter(d => new Date(d.startDate) >= new Date())
                      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                      .slice(0, 3)
                      .map((d) => {
                        const dateObj = new Date(d.startDate);
                        const dateStr = dateObj.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
                        const isSelected = selectedDate?.dateId === d.dateId;
                        return (
                          <button
                            key={d.dateId}
                            onClick={() => setSelectedDate(d)}
                            className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all min-w-[4.5rem]
                              ${isSelected ? "border-cyan-500 bg-cyan-50 text-cyan-700 ring-1 ring-cyan-500" : "border-slate-200 bg-white hover:border-cyan-300 text-slate-600"}
                            `}
                          >
                            <span className="font-bold text-sm">{dateStr}</span>
                          </button>
                        )
                      })
                    }
                    {/* Nút mở lịch */}
                    <button
                      onClick={() => setSelectedDate(prev => prev === "datepicker" ? null : "datepicker")}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border transition-all min-w-[4.5rem]
                        ${selectedDate === "datepicker" ? "border-cyan-500 bg-cyan-50 text-cyan-700" : "border-slate-200 bg-white hover:border-cyan-300 text-slate-600"}
                      `}
                    >
                      <CalendarIcon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase">Khác</span>
                    </button>
                  </div>

                  {/* Calendar Picker Dropdown */}
                  {selectedDate === "datepicker" && (
                    <div className="mt-4 p-2 bg-slate-50 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                      <DayPicker
                        mode="single"
                        disabled={(date) => !availableDates.some(d => new Date(d.startDate).toDateString() === date.toDateString())}
                        onSelect={(date) => {
                          if (date) {
                            const found = availableDates.find(d => new Date(d.startDate).toDateString() === date.toDateString());
                            if (found) {
                              setSelectedDate(found); // Set object date
                            }
                          }
                        }}
                        modifiersStyles={{ available: { color: "#0891b2", fontWeight: "bold" } }}
                        className="mx-auto"
                      />
                    </div>
                  )}
                </div>

                {/* Travelers */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="block font-bold text-slate-700 text-sm">Người lớn</span>
                      <span className="text-xs text-slate-400">Trên 9 tuổi</span>
                    </div>
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setTravelers(p => ({...p, adults: Math.max(1, p.adults - 1)}))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 rounded-l-lg">-</button>
                      <span className="w-8 text-center font-bold text-sm">{travelers.adults}</span>
                      <button onClick={() => setTravelers(p => ({...p, adults: p.adults + 1}))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-cyan-600 rounded-r-lg">+</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="block font-bold text-slate-700 text-sm">Trẻ em</span>
                      <span className="text-xs text-slate-400">5 - 9 tuổi</span>
                    </div>
                    <div className="flex items-center bg-white rounded-lg border border-slate-200 shadow-sm">
                      <button onClick={() => setTravelers(p => ({...p, children: Math.max(0, p.children - 1)}))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-slate-500 rounded-l-lg">-</button>
                      <span className="w-8 text-center font-bold text-sm">{travelers.children}</span>
                      <button onClick={() => setTravelers(p => ({...p, children: p.children + 1}))} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 text-cyan-600 rounded-r-lg">+</button>
                    </div>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex justify-between items-center py-4 border-t border-slate-100 mb-4">
                  <span className="font-bold text-slate-600">Tạm tính</span>
                  <span className="text-2xl font-extrabold text-blue-600">
                    {/* Tính tổng tiền (đã thêm hàm calculateTotalPrice) */}
                    {calculateTotalPrice().toLocaleString("vi-VN")}₫
                  </span>
                </div>

                <Button 
                  onClick={handleBookNow} 
                  disabled={isBooking || !selectedDate || selectedDate === "datepicker"}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold py-6 rounded-xl shadow-lg shadow-cyan-200 text-lg transition-all"
                >
                  {isBooking ? "Đang xử lý..." : "Đặt Tour Ngay"}
                </Button>

                {/* Host Info */}
                {tour.user && (
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                        <img src={tour.user.avatar || "https://github.com/shadcn.png"} className="w-full h-full object-cover" alt="host" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">Tổ chức bởi</p>
                        <p className="text-sm font-bold text-slate-800">{tour.user.fullName}</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full text-xs h-8 border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                        Liên hệ
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Support Box */}
              <div className="bg-blue-50 rounded-2xl p-6 text-center border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-blue-900 mb-1">Cần hỗ trợ tư vấn?</h4>
                <p className="text-xs text-blue-600 mb-3">Liên hệ ngay để được giải đáp 24/7</p>
                <a href="tel:19001234" className="text-lg font-black text-blue-700 hover:underline">1900 1234</a>
              </div>
            </div>
          </aside>
        </div>

        {/* RELATED TOURS */}
        {relativeTour.totalItems > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-cyan-400 rounded-full"></div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                Tour du lịch <span className="text-cyan-600">{tour.destination}</span> liên quan
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relativeTour.items.map((t) => (
                <div key={t.tourId} className="transform transition-all hover:-translate-y-1">
                  <TourCard tour={t} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ImageLightbox
        images={images}
        startIndex={lightboxStartIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* 🧾 Popup form đặt tour */}
      <Dialog open={openBookingForm} onOpenChange={setOpenBookingForm}>
        <DialogContent className="max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Điền thông tin để đặt tour
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleConfirmBooking();
            }}
            className="space-y-3"
          >
            <div>
              <label className="text-sm font-medium">Họ và tên *</label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2 border rounded-md"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Số điện thoại *</label>
              <input
                type="tel"
                required
                className="w-full mt-1 p-2 border rounded-md"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email *</label>
              <input
                type="email"
                required
                className="w-full mt-1 p-2 border rounded-md"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Địa chỉ *</label>
              <input
                type="text"
                required
                className="w-full mt-1 p-2 border rounded-md"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Mã Voucher (nếu có)</label>
              <input
                type="text"
                placeholder="Nhập mã giảm giá (nếu có)"
                className="w-full mt-1 p-2 border rounded-md"
                value={formData.voucher}
                onChange={(e) =>
                  setFormData({ ...formData, voucher: e.target.value })
                }
              />
            </div>

            <div className="border-t pt-3 text-sm text-muted-foreground">
              <p>
                <strong>Tổng tiền:</strong>{" "}
                {/* Gọi hàm tính tổng tiền */}
                {calculateTotalPrice().toLocaleString("vi-VN")} ₫
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenBookingForm(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-white"
                disabled={isBooking}
              >
                {isBooking ? "Đang xử lý..." : "Xác nhận đặt tour"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}