'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useRef, useState } from 'react';
import { SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { Advertisement } from '@/shared/config/advertisement';
import { useIsHydrated } from '@/shared/hooks/useIsHydrated';
import { cn } from '@/shared/lib/cn';
import { getDayBefore } from '@/shared/lib/utils/date';
import { getVisibleSlides } from '@/shared/lib/utils/swiper';
import { ArrowLeft } from '@/shared/ui/icons';
import SliderDots from '@/shared/ui/SliderDots';

import { ProductListQueries } from '@/entities/product-list';

import { ADProductRankingImageCard } from '@/entities/product-list';
import { ProductRankingImageCard } from '@/entities/product-list';

import { RankingPreview as DesktopRankingPreview } from './desktop/RankingSkeleton';
import { RankingPreview as MobileRankingPreview } from './mobile/RankingSkeleton';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
  ssr: false,
});

const indexAtom = atom(0);
const isInitAtom = atom(false);

const JirumRankingSlider = ({ config, isMobile }: { config: SwiperOptions; isMobile: boolean }) => {
  const isHydrated = useIsHydrated();

  const {
    data: { products },
  } = useSuspenseQuery(
    ProductListQueries.products({
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
            priority={slideIndex < 4}
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
        <button
          className="pc:flex mb-5 hidden size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
          onClick={handleSlidePrev}
          name="이전"
        >
          <ArrowLeft className="mr-1 size-8 text-white" color="white" />
        </button>
        {!canRender && (
          <div className="invisible">
            {isMobile ? (
              <MobileRankingPreview products={products} />
            ) : (
              <DesktopRankingPreview products={products} />
            )}
          </div>
        )}
        <motion.div
          className={cn(
            'pc:max-w-slider-max max-w-mobile-max w-full overflow-visible',
            !canRender && 'pc:hidden',
          )}
          initial={{ opacity: canRender ? 1 : 0 }}
          animate={{ opacity: canRender ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Swiper
            {...config}
            onRealIndexChange={handleIndexChange}
            onAfterInit={handleAfterInit}
            initialSlide={index}
          >
            {renderProducts()}
          </Swiper>
        </motion.div>
        <button
          className="pc:flex mb-5 hidden size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
          onClick={handleSlideNext}
          name="다음"
        >
          <ArrowLeft className="ml-1 size-8 -scale-x-100 text-white" color="white" />
        </button>

        <AnimatePresence>
          {!canRender && (
            <motion.div
              className="pc:px-16 absolute inset-0 bottom-auto z-10"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isMobile ? (
                <MobileRankingPreview products={products} />
              ) : (
                <DesktopRankingPreview products={products} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SliderDots
        total={products.length + (Advertisement.Persil_20251124.isInPeriod() ? 1 : 0)}
        visibleSlides={visibleSlides}
      />
    </>
  );
};

export default JirumRankingSlider;
