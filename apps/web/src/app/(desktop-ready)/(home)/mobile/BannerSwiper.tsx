'use client';

import { Children, useRef } from 'react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';

const MOBILE_SWIPER_OPTIONS: SwiperOptions & AutoplayOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 12,
  loop: true,
  autoplay: {
    delay: 3000,
    disableOnInteraction: false,
  },
};

const BannerSwiper = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const isHydrated = useIsHydrated();

  const childrenCount = Children.count(children);
  const initialSlide = Math.floor(Math.random() * childrenCount);
  const progressBarRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={cn(
        'relative transition-opacity duration-300',
        isHydrated && 'opacity-100',
        !isHydrated && 'opacity-0',
      )}
    >
      <Swiper
        className={cn('flex w-full', className)}
        modules={[Autoplay]}
        {...MOBILE_SWIPER_OPTIONS}
        initialSlide={initialSlide}
        onAutoplayTimeLeft={(_, __, progress) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.setProperty('--progress', `${1 - progress}`);
          }
        }}
      >
        {Children.map(children, (child) => {
          return <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>{child}</SwiperSlide>;
        })}
      </Swiper>
      <div className="absolute -bottom-3 right-6 z-10 h-[4px] w-[60px]">
        <div className="h-full w-full overflow-hidden rounded-full bg-white/20">
          <div
            className="h-full bg-white"
            style={{
              width: `calc(100% * var(--progress))`,
            }}
            ref={progressBarRef}
          />
        </div>
      </div>
    </div>
  );
};

export default BannerSwiper;
