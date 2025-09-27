'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useMemo, useRef, useState } from 'react';
import { SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ArrowLeft } from '@/components/common/icons';
import { Advertisement } from '@/constants/advertisement';
import ADProductRankingImageCard from '@/features/products/ranking/ADProductRankingImageCard';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { getVisibleSlides } from '@/shared/lib/utils/swiper';

import { ProductQueries } from '@entities/product';

import ProductRankingImageCard from '@features/products/ranking/ProductRankingImageCard';

import { RankingSkeleton as DesktopRankingSkeleton } from '../desktop/RankingSkeleton';
import { RankingSkeleton as MobileRankingSkeleton } from '../mobile/RankingSkeleton';

import SliderDots from './SliderDots';

const Swiper = dynamic(() => import('swiper/react').then((mod) => mod.Swiper), {
  ssr: false,
});

const indexAtom = atom(0);
const isInitAtom = atom(false);

const JirumRankingSlider = ({ config, isMobile }: { config: SwiperOptions; isMobile: boolean }) => {
  const isHydrated = useIsHydrated();

  const {
    data: { rankingProducts },
  } = useSuspenseQuery(ProductQueries.ranking());

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

  const isActiveAdvertise = Advertisement.Beproc.isInPeriod();

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
        {!canRender &&
          (isMobile ? (
            <div className="invisible">
              <MobileRankingSkeleton />
            </div>
          ) : (
            <div className="max-w-slider-max grid w-full grow grid-cols-4 gap-x-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="basis-1/4">
                  <div className="aspect-square w-full" />
                  <div className="h-32.5" />
                </div>
              ))}
            </div>
          ))}
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
            {isActiveAdvertise && (
              <SwiperSlide
                className={cn('pb-5')}
                style={{ width: isMobile ? '240px' : 'calc((100% - 72px) / 4)' }}
              >
                <ADProductRankingImageCard
                  url={Advertisement.Beproc.url}
                  product={
                    {
                      id: '-1',
                      title: '비프록 음식물 처리기 화이트팟/실버맥스',
                      price: '299,000원~',
                      thumbnail: '/beproc_product_img_1.webp',
                      categoryId: 0,
                      beforePrice: '999,000원',
                    } as const
                  }
                  activeIndex={index}
                  index={0}
                />
              </SwiperSlide>
            )}
            {rankingProducts.map((product, i) => (
              <SwiperSlide
                className={cn('pb-5')}
                key={product.id}
                style={{ width: isMobile ? '240px' : 'calc((100% - 72px) / 4)' }}
              >
                <ProductRankingImageCard
                  activeIndex={isActiveAdvertise ? index - 1 : index}
                  index={i}
                  product={product}
                />
              </SwiperSlide>
            ))}
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
              className="pc:px-16 absolute inset-0 bottom-auto z-10 animate-pulse"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isMobile ? <MobileRankingSkeleton /> : <DesktopRankingSkeleton />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SliderDots
        total={rankingProducts.length + (Advertisement.Beproc.isInPeriod() ? 1 : 0)}
        visibleSlides={visibleSlides}
      />
    </>
  );
};

export default JirumRankingSlider;
