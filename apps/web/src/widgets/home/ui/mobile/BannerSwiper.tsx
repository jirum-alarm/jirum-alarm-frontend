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

import AppDownloadBanner from '@/features/app-download/ui/AppDownloadBanner';
import AboutLink from '@/features/banner/ui/items/AboutLink';
import AdBanner from '@/features/banner/ui/items/AdBanner';
import KakaoOpenChatLink from '@/features/banner/ui/items/KakaoOpenChatLink';

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
  const { device, isHydrated } = useDevice();
  const { type, link } = useAppDownloadLink(device);

  const initialSlide = 0; //Math.floor(Math.random() * 3);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useAtom(isInitAtom);

  const canRenderAppDownload = isHydrated && type && link;

  // Persil 광고 기간일 때는 단일 배너만 렌더링
  if (Advertisement.Persil_20251124.isInPeriod()) {
    return (
      <div className="mx-5">
        <AdBanner isMobile={true} priority />
      </div>
    );
  }

  // SSR Placeholder: 첫 번째 배너를 서버에서 미리 렌더링
  // Swiper가 로드되기 전까지 이 배너가 보임
  const renderSSRPlaceholder = () => {
    // 첫 번째로 보여줄 배너 결정 (앱 다운로드 > 카카오 순서)
    if (device.isJirumAlarmApp) {
      return <KakaoOpenChatLink isMobile={true} priority />;
    }
    if (canRenderAppDownload) {
      return <AppDownloadBanner type={type} link={link} />;
    }
    return <KakaoOpenChatLink isMobile={true} priority />;
  };

  // 중복 제거
  const renderBanners = () => {
    const promoBannerGenerator = Advertisement.Persil_20251124.isInPeriod()
      ? (i: number) => (
          <SwiperSlide key={`${i}-persil-2511-banner`} style={{ width: 'calc(100% - 50px)' }}>
            <AdBanner isMobile={true} priority={i === 0} />
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
                {/* 만약 Persil 배너가 없고(undefined), i===0이면 첫 번째 */}
                <KakaoOpenChatLink isMobile={true} priority={i === 0 && !promoBannerGenerator} />
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
            {canRenderAppDownload && (
              <SwiperSlide key={`${i}-app-download-cta`} style={{ width: 'calc(100% - 50px)' }}>
                <AppDownloadBanner type={type} link={link} />
              </SwiperSlide>
            )}
            <SwiperSlide key={`${i}-kakao-open-chat-link`} style={{ width: 'calc(100% - 50px)' }}>
              {/* Persil X, AppDownload X (type&&link false) 이면 Kakao가 첫번째 */}
              <KakaoOpenChatLink
                isMobile={true}
                priority={i === 0 && !promoBannerGenerator && !canRenderAppDownload}
              />
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
    <div className="max-w-mobile-max relative w-full">
      {/* SSR Placeholder: Swiper 로드 전까지 첫 번째 배너를 보여줌 */}
      {/* h-[92px]로 높이를 미리 확보하여 레이아웃 시프트 방지 */}
      {!isInit && (
        <div className="flex h-[92px] items-center justify-center px-5">
          <div style={{ width: 'calc(100% - 10px)' }}>{renderSSRPlaceholder()}</div>
        </div>
      )}

      {/* Swiper: 클라이언트에서 초기화 후 표시 */}
      <div
        className={cn(
          'transition-opacity duration-300',
          isInit ? 'opacity-100' : 'absolute inset-0 opacity-0',
        )}
      >
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
    </div>
  );
};

export default BannerSwiper;
