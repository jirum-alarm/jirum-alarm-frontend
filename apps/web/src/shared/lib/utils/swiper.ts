import { SwiperClass } from 'swiper/react';

export const getVisibleSlides = (swiper: SwiperClass) => {
  const slides = swiper.slides;
  if (!slides.length) return [];

  const slidesPerView = swiper.params.slidesPerView;
  const realIndex = swiper.realIndex;
  if (typeof slidesPerView !== 'number') return [realIndex];

  const visibleIndices = [];
  for (let i = 0; i < slidesPerView; i++) {
    const index = (realIndex + i) % slides.length;
    visibleIndices.push(index);
  }

  return visibleIndices;
};
