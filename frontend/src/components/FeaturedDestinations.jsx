import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FeaturedDestinations({ title, destinations }) {
  return (
    <div className="container mx-auto px-6 relative">
      <h2 className="text-3xl font-bold text-center mb-8">{title}</h2>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
        slidesPerView={3}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        pagination={{ clickable: true }}
        breakpoints={{
          320: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="relative"
      >
        {destinations.map((dest, i) => (
          <SwiperSlide key={i}>
            <div className="rounded-lg overflow-hidden shadow-lg bg-white">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg">{dest.name}</h3>
                <p className="text-gray-500">{dest.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <button className="custom-prev absolute top-1/2 -left-6 h-48 w-8 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded-full shadow">
        &#10094;
      </button>
      <button className="custom-next absolute top-1/2 -right-6 h-48 w-8 transform -translate-y-1/2 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded-full shadow">
        &#10095;
      </button>
    </div>
  );
}
