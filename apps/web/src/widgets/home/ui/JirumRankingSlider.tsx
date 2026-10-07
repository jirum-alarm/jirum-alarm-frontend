'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { m } from 'motion/react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { Advertisement } from '@/shared/config/advertisement';
import { useIsHydrated } from '@/shared/hooks/useIsHydrated';
import { cn } from '@/shared/lib/cn';
import { getDayBefore } from '@/shared/lib/utils/date';
import { getVisibleSlides } from '@/shared/lib/utils/swiper';
import { ArrowLeft } from '@/shared/ui/common/icons';

import { ProductQueries } from '@/entities/product';
import ADProductRankingImageCard from '@/entities/product-list/ui/ranking/ADProductRankingImageCard';
import ProductRankingImageCard from '@/entities/product-list/ui/ranking/ProductRankingImageCard';

import { RankingPreview as DesktopRankingPreview } from './desktop/RankingSkeleton';
import { RankingPreview as MobileRankingPreview } from './mobile/RankingSkeleton';
import SliderDots from './SliderDots';

const indexAtom = atom(0);
const isInitAtom = atom(false);

const JirumRankingSlider = ({ config, isMobile }: { config: SwiperOptions; isMobile: boolean }) => {
  const isHydrated = useIsHydrated();

  const {
    data: { products },
  } = useSuspenseQuery(
    ProductQueries.products({
      limit: 10,
      orderBy: ProductOrderType.CommunityRanking,
      startDate: getDayBefore(3),
      categoryId: null,
      orderOption: OrderOptionType.Desc,
      isEnd: false,
    }),
  );

  const [index, setIndex] = useAtom(indexAtom);
  const swiperRef = useRef<SwiperClass>(null);
  const [isInit, setIsInit] = useAtom(isInitAtom);
  const canRender = useMemo(() => isHydrated && isInit, [isHydrated, isInit]);
  const [visibleSlides, setVisibleSlides] = useState<number[]>([]);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
    setIsInit(true);
    setVisibleSlides(getVisibleSlides(swiper));
  };

  const handleIndexChange = (swiper: SwiperClass) => {
    setIndex(swiper.realIndex);
    const visibleIndices = getVisibleSlides(swiper);
    setVisibleSlides(visibleIndices);
  };

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  const isActiveAdvertise = Advertisement.Persil_20251124.isInPeriod();

  const renderProducts = useCallback(() => {
    const productList = products.map((product, i) => {
      const slideIndex = !isMobile && isActiveAdvertise && i >= 3 ? i + 1 : i;
      return (
        <SwiperSlide
          className={cn('pb-5')}
          key={product.id}
          style={{ width: isMobile ? '240px' : 'calc((100% - 72px) / 4)' }}
        >
          <ProductRankingImageCard
            activeIndex={index}
            index={slideIndex}
            rank={i + 1}
            product={product}
            // 모바일 loop 는 마지막 상품이 첫 화면 왼쪽에 걸린다 — lazy 면 스와이퍼가 뜬 뒤에야 받아서
            // 미리보기에 있던 사진이 빈칸으로 돌아갔다 다시 뜬다.
            priority={slideIndex < 4 || (isMobile && i === products.length - 1)}
            source="home_ranking"
          />
        </SwiperSlide>
      );
    });
    if (!isActiveAdvertise) {
      return productList;
    }

    const AdSlide = (
      <SwiperSlide
        key="ad-slide"
        className={cn('pb-5')}
        style={{ width: isMobile ? '240px' : 'calc((100% - 72px) / 4)' }}
      >
        <ADProductRankingImageCard
          url={'https://ibpartner.cafe24.com/surl/O/807'}
          product={
            {
              id: '-1',
              title: '퍼실 파워젤 듀얼(드럼/일반 겸용) 1.8L x6개',
              beforePrice: '111,000원',
              price: '36,000원',
              thumbnail: '/persil_2511_product.png',
              categoryId: 0,
            } as const
          }
          activeIndex={index}
          index={isMobile ? products.length : 3}
        />
      </SwiperSlide>
    );

    if (isMobile) {
      return [...productList, AdSlide];
    }

    const desktopList = [...productList];
    desktopList.splice(3, 0, AdSlide);
    return desktopList;
  }, [products, isActiveAdvertise, isMobile, index]);

  return (
    <>
      <div className="relative flex w-full items-center gap-x-5 gap-y-3">
        <m.button
          className="pc:flex bg-fixed-800 mb-5 hidden size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-0"
          onClick={handleSlidePrev}
          name="이전"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <ArrowLeft className="text-fixed-white mr-1 size-8" color="white" />
        </m.button>
        {!canRender && (
          <div className="invisible">
            {isMobile ? (
              <MobileRankingPreview products={products} />
            ) : (
              <DesktopRankingPreview products={products} />
            )}
          </div>
        )}
        {/* 미리보기 → 스와이퍼는 페이드 없이 한 프레임에 바꾼다. 같은 카드·같은 사진이라 즉시 바꿔도 티가 안 나고,
            페이드를 걸면 미리보기가 먼저 빠진 사이 랭킹 영역이 통째로 하얗게 비었다가 차오르는 게 보였다. */}
        <div
          className={cn(
            'pc:max-w-slider-max max-w-mobile-max w-full overflow-visible',
            !canRender && 'pc:hidden opacity-0',
          )}
        >
          <Swiper
            {...config}
            onRealIndexChange={handleIndexChange}
            onAfterInit={handleAfterInit}
            initialSlide={index}
          >
            {renderProducts()}
          </Swiper>
        </div>
        <m.button
          className="pc:flex bg-fixed-800 mb-5 hidden size-11 shrink-0 items-center justify-center rounded-full disabled:opacity-0"
          onClick={handleSlideNext}
          name="다음"
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.1 }}
        >
          <ArrowLeft className="text-fixed-white ml-1 size-8 -scale-x-100" color="white" />
        </m.button>

        {!canRender && (
          <div className="pc:px-16 absolute inset-0 bottom-auto z-10">
            {isMobile ? (
              <MobileRankingPreview products={products} />
            ) : (
              <DesktopRankingPreview products={products} />
            )}
          </div>
        )}
      </div>
      <SliderDots
        total={products.length + (Advertisement.Persil_20251124.isInPeriod() ? 1 : 0)}
        visibleSlides={visibleSlides}
      />
    </>
  );
};

export default JirumRankingSlider;
