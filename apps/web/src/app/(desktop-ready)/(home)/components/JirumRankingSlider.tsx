'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import dynamic from 'next/dynamic';
import { useMemo, useRef } from 'react';
import { SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ArrowLeft } from '@/components/common/icons';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';

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

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
    setIsInit(true);
  };

  const handleIndexChange = (swiper: SwiperClass) => {
    setIndex(swiper.realIndex);
  };

  const handleSlidePrev = () => {
    swiperRef.current?.slidePrev();
  };

  const handleSlideNext = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <>
      <div className="relative flex w-full items-center gap-x-5 gap-y-3">
        <button
          className="pc:flex hidden size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
          onClick={handleSlidePrev}
          disabled={index === 0}
          name="이전"
        >
          <ArrowLeft className="mr-1 size-8 text-white" color="white" />
        </button>
        {!isInit && (
          <div className="w-slider-max grid grid-cols-4 gap-x-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="mb-33.75 aspect-square" />
            ))}
          </div>
        )}
        <motion.div
          className={cn('max-w-slider-max overflow-visible')}
          initial={{ opacity: canRender ? 1 : 0 }}
          animate={{ opacity: canRender ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <Swiper
            {...config}
            onRealIndexChange={handleIndexChange}
            onAfterInit={handleAfterInit}
            initialSlide={index + (isMobile ? 0 : (config.slidesPerView as number) - 1)}
          >
            {rankingProducts.map((product, i) => (
              <SwiperSlide
                className={cn('pb-5')}
                key={product.id}
                style={{ width: isMobile ? '240px' : 'calc((100% - 72px) / 4)' }}
              >
                <ProductRankingImageCard activeIndex={index} index={i} product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
        <button
          className="pc:flex hidden size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
          onClick={handleSlideNext}
          disabled={index === rankingProducts.length - 4}
          name="다음"
        >
          <ArrowLeft className="ml-1 size-8 -scale-x-100 text-white" color="white" />
        </button>

        <AnimatePresence>
          {!canRender && (
            <motion.div
              className="absolute inset-0 bottom-auto z-10 animate-pulse px-16"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isMobile ? <MobileRankingSkeleton /> : <DesktopRankingSkeleton />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <SliderDots total={rankingProducts.length - (isMobile ? 0 : 3)} activeIndex={index} />
    </>
  );
};

export default JirumRankingSlider;
