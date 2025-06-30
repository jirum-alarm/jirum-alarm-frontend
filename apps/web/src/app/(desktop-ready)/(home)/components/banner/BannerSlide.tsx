import { SwiperSlide } from 'swiper/react';

const BannerSlide = ({ children }: { children: React.ReactNode }) => {
  return <SwiperSlide>{children}</SwiperSlide>;
};

export default BannerSlide;
