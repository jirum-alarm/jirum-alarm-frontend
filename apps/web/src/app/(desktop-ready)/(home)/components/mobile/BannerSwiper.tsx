'use client';

import { Children } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { cn } from '@/lib/cn';

const MOBILE_SWIPER_OPTIONS: SwiperOptions & AutoplayOptions = {
  slidesPerView: 1,
  spaceBetween: 0,
  loop: true,
  delay: 3000,
};

const BannerSwiper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <Swiper
      className={cn('flex w-full', className)}
      modules={[Autoplay]}
      {...MOBILE_SWIPER_OPTIONS}
    >
      {Children.map(children, (child) => {
        return <SwiperSlide className="px-5">{child}</SwiperSlide>;
      })}
    </Swiper>
  );
};

export default BannerSwiper;
