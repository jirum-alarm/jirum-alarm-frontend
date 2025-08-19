'use client';

import { atom, useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { cloneElement, Fragment, useRef } from 'react';
import { Autoplay } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { CheckDeviceResult } from '@/app/actions/agent.types';
import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';

import AboutLink from '@features/banner/items/AboutLink';
import AppDownloadCTA from '@features/banner/items/AppDownloadCTA';
import KakaoOpenChatLink from '@features/banner/items/KakaoOpenChatLink';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
  ssr: false,
});

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

const isInitAtom = atom(false);

const BannerSwiper = ({ device }: { device: CheckDeviceResult }) => {
  const initialSlide = Math.floor(Math.random() * 3);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useAtom(isInitAtom);

  // 중복 제거
  const renderBanners = () => {
    if (device.isJirumAlarmApp) {
      // KakaoOpenChatLink, AboutLink 반복 3회
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <Fragment key={i}>
              <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>
                <KakaoOpenChatLink isMobile={true} />
              </SwiperSlide>
              <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>
                <AboutLink isMobile={true} />
              </SwiperSlide>
            </Fragment>
          ))}
        </>
      );
    }

    // AppDownloadCTA, KakaoOpenChatLink, AboutLink 반복 2회
    return (
      <>
        {[...Array(2)].map((_, i) => (
          <Fragment key={i}>
            <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>
              <AppDownloadCTA device={device} />
            </SwiperSlide>
            <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>
              <KakaoOpenChatLink isMobile={true} />
            </SwiperSlide>
            <SwiperSlide style={{ width: 'calc(100% - 50px)' }}>
              <AboutLink isMobile={true} />
            </SwiperSlide>
          </Fragment>
        ))}
      </>
    );
  };

  return (
    <div
      className={cn(
        'max-w-mobile-max relative w-full transition-opacity',
        isInit && 'opacity-100',
        !isInit && 'opacity-0',
      )}
    >
      {/* <CheckMount label="BannerSwiper" /> */}
      <Swiper
        className={cn('flex w-full')}
        modules={[Autoplay]}
        {...MOBILE_SWIPER_OPTIONS}
        initialSlide={initialSlide}
        onAfterInit={() => {
          setIsInit(true);
        }}
        onAutoplayTimeLeft={(_, __, progress) => {
          if (progressBarRef.current) {
            progressBarRef.current.style.setProperty('--progress', `${1 - progress}`);
          }
        }}
      >
        {renderBanners()}
      </Swiper>
      <div className="absolute right-6.25 -bottom-3.75 z-10 h-[4px] w-15">
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
