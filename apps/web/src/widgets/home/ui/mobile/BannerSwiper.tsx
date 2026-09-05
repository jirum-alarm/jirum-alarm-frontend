'use client';

import { useQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import dynamic from 'next/dynamic';
import { Fragment, useEffect, useRef } from 'react';
import { Autoplay } from 'swiper/modules';
import { SwiperSlide } from 'swiper/react';
import { AutoplayOptions, SwiperOptions } from 'swiper/types';

import { AdvertiseSlotLocation } from '@/shared/api/gql/graphql';
import { Advertisement } from '@/shared/config/advertisement';
import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';
import { useDevice } from '@/shared/hooks/useDevice';
import { cn } from '@/shared/lib/cn';

import { AdvertisementQueries } from '@/entities/advertisement/api';

import AppDownloadBanner from '@/features/app-download/ui/AppDownloadBanner';
import { AdvertiseSlotBanner } from '@/features/banner';
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
  const { data: homeCarouselAds = [] } = useQuery(
    AdvertisementQueries.activeAds({
      slotLocation: AdvertiseSlotLocation.HomeCarouselBanner,
    }),
  );

  const initialSlide = 0; //Math.floor(Math.random() * 3);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isInit, setIsInit] = useAtom(isInitAtom);

  // 재방문 시 Swiper 미초기화 상태에서 표시되는 것을 방지
  useEffect(() => {
    setIsInit(false);
    return () => {
      setIsInit(false);
    };
  }, [setIsInit]);

  // 사파리는 네이티브 Smart App Banner(apple-itunes-app 메타)가 같은 역할을 해서
  // 슬라이드까지 넣으면 "앱 받으세요"가 화면에 두 번 뜬다. 사파리에서만 뺀다.
  // 카톡·인스타 등 인앱 브라우저는 UA 에 Safari 가 붙어 isSafari 로 잡히지만
  // 네이티브 배너가 뜨지 않으므로 슬라이드를 남겨야 한다(iOS 크롬도 동일).
  //
  // device 는 서버 UA 판정이 그대로 온다(ServerStateProvider). 예전엔 여기서
  // navigator.userAgent 를 직접 읽어 SSR 엔 빈 문자열 → 항상 false 였고,
  // isHydrated 게이트까지 겹쳐 배너 종류가 하이드레이션 직후 통째로 바뀌었다.
  const hasNativeAppBanner = device.isSafari && !device.isInAppBrowser;
  const canRenderAppDownload = Boolean(type && link && !hasNativeAppBanner);
  const hasHomeCarouselAds = homeCarouselAds.length > 0;

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

    const homeCarouselAdSlides = homeCarouselAds.map((ad, index) => (
      <SwiperSlide
        key={`home-carousel-ad-${ad.id}`}
        style={{ width: 'calc(100% - 50px)' }}
        data-swiper-autoplay="6000"
      >
        <AdvertiseSlotBanner
          slotLocation={AdvertiseSlotLocation.HomeCarouselBanner}
          creative={ad}
          surfaceClassName="border-0 bg-transparent"
          priority={index === 0}
        />
      </SwiperSlide>
    ));

    if (device.isJirumAlarmApp) {
      // KakaoOpenChatLink, AboutLink 반복 3회
      return (
        <>
          {homeCarouselAdSlides}
          {[...Array(3)].map((_, i) => (
            <Fragment key={i}>
              {promoBannerGenerator?.(i)}
              <SwiperSlide key={`${i}-kakao-open-chat-link`} style={{ width: 'calc(100% - 50px)' }}>
                {/* 만약 Persil 배너가 없고(undefined), i===0이면 첫 번째 */}
                <KakaoOpenChatLink
                  isMobile={true}
                  priority={i === 0 && !promoBannerGenerator && !hasHomeCarouselAds}
                />
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
        {homeCarouselAdSlides}
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
                priority={
                  i === 0 && !promoBannerGenerator && !canRenderAppDownload && !hasHomeCarouselAds
                }
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

      {/* Swiper: hydration 완료 후에만 마운트하여 슬라이드 수 변경 방지 */}
      {isHydrated && (
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
      )}
    </div>
  );
};

export default BannerSwiper;
