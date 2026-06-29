'use client';

import 'swiper/css';

import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { type ReactNode, useRef, useState } from 'react';
import { Autoplay } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import { Advertisement } from '@/shared/config/advertisement';

import { AdvertisementQueries } from '@/entities/advertisement/api';

import { AdvertiseSlotBanner } from '@/features/banner';
import AboutLink from '@/features/banner/ui/items/AboutLink';
import AdBanner from '@/features/banner/ui/items/AdBanner';
import KakaoOpenChatLink from '@/features/banner/ui/items/KakaoOpenChatLink';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
  ssr: false,
});

const DESKTOP_BANNER_SWIPER_OPTIONS: SwiperOptions & AutoplayOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  spaceBetween: 20,
  allowTouchMove: false,
  simulateTouch: false,
  watchOverflow: false,
  autoplay: {
    delay: 5000,
    disableOnInteraction: false,
  },
};

const DESKTOP_BANNER_SLIDE_CLASS = '!h-[120px] !w-[528px]';
const DESKTOP_BANNER_ITEM_CLASS = 'pc:w-full pc:grow-0 pc:pl-[32px]';
const DESKTOP_BANNER_REPEAT_COUNT = 7;
const DESKTOP_BANNER_MIDDLE_SET_INDEX = Math.floor(DESKTOP_BANNER_REPEAT_COUNT / 2);

const getRealSlideIndex = (index: number, slideCount: number) => {
  return ((index % slideCount) + slideCount) % slideCount;
};

const Banner = () => {
  const isPersilBanner = Advertisement.Persil_20251124.isInPeriod();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const { data: homeCarouselAds = [] } = useQuery(
    AdvertisementQueries.activeAds({
      slotLocation: AdvertiseSlotLocation.HomeCarouselBanner,
    }),
  );

  if (homeCarouselAds.length > 0) {
    const baseSlides = [
      ...homeCarouselAds.map((ad, index) => (
        <AdvertiseSlotBanner
          key={`home-carousel-ad-${ad.id}`}
          slotLocation={AdvertiseSlotLocation.HomeCarouselBanner}
          creative={ad}
          className="h-full w-full"
          surfaceClassName="border-0 bg-transparent"
          priority={index === 0}
        />
      )),
      <KakaoOpenChatLink
        key="kakao-open-chat-link"
        isMobile={false}
        className={DESKTOP_BANNER_ITEM_CLASS}
      />,
      <AboutLink key="about-link" isMobile={false} className={DESKTOP_BANNER_ITEM_CLASS} />,
    ];
    const initialSlideIndex = baseSlides.length * DESKTOP_BANNER_MIDDLE_SET_INDEX;
    const slides = Array.from({ length: DESKTOP_BANNER_REPEAT_COUNT }).flatMap((_, setIndex) =>
      baseSlides.map((slide, slideIndex) => ({
        id: `${setIndex}-${slideIndex}`,
        realIndex: slideIndex,
        node: slide as ReactNode,
      })),
    );

    const normalizeSwiperIndex = (swiper: {
      activeIndex: number;
      slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
    }) => {
      const minStableIndex = baseSlides.length;
      const maxStableIndex = baseSlides.length * (DESKTOP_BANNER_REPEAT_COUNT - 1) - 1;

      if (swiper.activeIndex >= minStableIndex && swiper.activeIndex <= maxStableIndex) {
        return;
      }

      const normalizedIndex =
        initialSlideIndex + getRealSlideIndex(swiper.activeIndex, baseSlides.length);
      swiper.slideTo(normalizedIndex, 0, false);
      setActiveSlideIndex(normalizedIndex);
    };

    const renderProgress = (index: number) => {
      if (index !== activeSlideIndex) return null;

      return (
        <div className="pointer-events-none absolute top-2 right-2 z-20 h-1 w-16">
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
      );
    };

    return (
      <div
        className="relative mx-auto mt-8 mb-10 h-[120px] w-full max-w-[1208px] overflow-hidden"
        data-home-desktop-banner-carousel
      >
        <div className="pointer-events-none absolute top-[-40px] left-0 z-10 h-[200px] w-[60px] bg-linear-to-r from-[#101828] to-transparent" />
        <div className="pointer-events-none absolute top-[-40px] right-0 z-10 h-[200px] w-[60px] bg-linear-to-l from-[#101828] to-transparent" />
        <Swiper
          className="h-full w-full overflow-visible"
          modules={[Autoplay]}
          {...DESKTOP_BANNER_SWIPER_OPTIONS}
          initialSlide={initialSlideIndex}
          onAfterInit={(swiper) => {
            setActiveSlideIndex(swiper.activeIndex);
          }}
          onSlideChange={(swiper) => {
            setActiveSlideIndex(swiper.activeIndex);
            progressBarRef.current?.style.setProperty('--progress', '0');
          }}
          onSlideChangeTransitionEnd={normalizeSwiperIndex}
          onAutoplayTimeLeft={(_, __, progress) => {
            if (progressBarRef.current) {
              progressBarRef.current.style.setProperty('--progress', `${1 - progress}`);
            }
          }}
        >
          {slides.map(({ id, node, realIndex }, index) => (
            <SwiperSlide
              key={id}
              className={DESKTOP_BANNER_SLIDE_CLASS}
              data-swiper-autoplay={realIndex < homeCarouselAds.length ? '6000' : undefined}
            >
              <div className="relative h-full w-full">
                {node}
                {renderProgress(index)}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  return (
    <div className="max-w-slider-max mx-auto mt-8 mb-10 flex h-[120px] w-full gap-x-[25px]">
      {isPersilBanner ? (
        <AdBanner isMobile={false} />
      ) : (
        <>
          <KakaoOpenChatLink isMobile={false} />
          <AboutLink isMobile={false} />
        </>
      )}
    </div>
  );
};

export default Banner;
