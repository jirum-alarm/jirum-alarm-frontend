'use client';

import { atom, useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { Fragment, useRef } from 'react';
import { Autoplay } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { Advertisement } from '@/shared/config/advertisement';
import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';
import { useDevice } from '@/shared/hooks/useDevice';
import { cn } from '@/shared/lib/cn';

import { AboutLink, AdBanner, AppDownloadCTA, KakaoOpenChatLink } from '@/features/banner';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
  ssr: false,
});

const MOBILE_SWIPER_OPTIONS: SwiperOptions & AutoplayOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 12,
  loop: true,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
};

const isInitAtom = atom(false);

const BannerSwiper = () => {
  const { device } = useDevice();
  const { type, link } = useAppDownloadLink(device);

  const initialSlide = 0; //Math.floor(Math.random() * 3);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useAtom(isInitAtom);

  if (Advertisement.Persil_20251124.isInPeriod()) {
    return (
      <div className="mx-5">
        <AdBanner isMobile={true} />
      </div>
    );
  }

  // 중복 제거
  const renderBanners = () => {
    const promoBannerGenerator = Advertisement.Persil_20251124.isInPeriod()
      ? (i: number) => (
          <SwiperSlide key={`${i}-persil-2511-banner`} style={{ width: 'calc(100% - 50px)' }}>
            <AdBanner isMobile={true} />
          </SwiperSlide>
        )
      : undefined;

    if (device.isJirumAlarmApp) {
      // KakaoOpenChatLink, AboutLink 반복 3회
      return (
        <>
          {[...Array(3)].map((_, i) => (
            <Fragment key={i}>
              {promoBannerGenerator?.(i)}
              <SwiperSlide key={`${i}-kakao-open-chat-link`} style={{ width: 'calc(100% - 50px)' }}>
                <KakaoOpenChatLink isMobile={true} />
              </SwiperSlide>
              <SwiperSlide key={`${i}-about-link`} style={{ width: 'calc(100% - 50px)' }}>
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
            {promoBannerGenerator?.(i)}
            {type && link && (
              <SwiperSlide key={`${i}-app-download-cta`} style={{ width: 'calc(100% - 50px)' }}>
                <AppDownloadCTA type={type} link={link} />
              </SwiperSlide>
            )}
            <SwiperSlide key={`${i}-kakao-open-chat-link`} style={{ width: 'calc(100% - 50px)' }}>
              <KakaoOpenChatLink isMobile={true} />
            </SwiperSlide>
            <SwiperSlide key={`${i}-about-link`} style={{ width: 'calc(100% - 50px)' }}>
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
      <div className="absolute top-2 right-10 z-10 h-1 w-8">
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
