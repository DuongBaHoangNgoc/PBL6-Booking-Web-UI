"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/navigation"
import "swiper/css/pagination"

export default function FeaturedDestinations({ title, destinations }) {
  const handlePrevClick = () => {
    const prevBtn = document.querySelector(".custom-prev")
    prevBtn?.click()
  }

  const handleNextClick = () => {
    const nextBtn = document.querySelector(".custom-next")
    nextBtn?.click()
  }

  return (
    <div className="container mx-auto px-6 relative">
      <h2 className="text-3xl font-bold text-center mb-8 text-[#1a5f7a]">{title}</h2>

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
            <div className="rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow cursor-pointer">
              <img src={dest.image || "/placeholder.svg"} alt={dest.name} className="w-full h-56 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold text-lg text-[#1a5f7a]">{dest.name}</h3>
                <p className="text-[#ff6b6b] font-semibold">{dest.price}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <button
        onClick={handlePrevClick}
        className="custom-prev absolute top-1/2 -left-6 h-48 w-8 transform -translate-y-1/2 bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] p-2 rounded-full shadow transition-all active:scale-90"
        aria-label="Previous slide"
      >
        &#10094;
      </button>
      <button
        onClick={handleNextClick}
        className="custom-next absolute top-1/2 -right-6 h-48 w-8 transform -translate-y-1/2 bg-[#5dd9c1] hover:bg-[#4bc9b0] text-[#1a5f7a] p-2 rounded-full shadow transition-all active:scale-90"
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </div>
  )
}
