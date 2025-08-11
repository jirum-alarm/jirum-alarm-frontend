'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { atom, useAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ArrowLeft } from '@/components/common/icons';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';

import { ProductQueries } from '@entities/product';

import ProductRankingImageCard from '@features/products/ranking/ProductRankingImageCard';

import { RankingSkeleton as DesktopRankingSkeleton } from '../desktop/RankingSkeleton';
import { RankingSkeleton as MobileRankingSkeleton } from '../mobile/RankingSkeleton';

const SliderDots = ({ total, activeIndex }: { total: number; activeIndex: number }) => (
  <div className="pc:w-[100px] mx-auto flex h-5 w-full items-center justify-center" role="tablist">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={activeIndex === i}
        aria-label={`슬라이드 ${i + 1}`}
        className={cn(
          `pc:grow pc:bg-gray-500 h-[3px] w-[3px] bg-gray-400`,
          activeIndex === i &&
            'pc:w-[32px] pc:bg-gray-300 mr-[6px] ml-[6px] h-[4px] w-[4px] bg-gray-600',
        )}
      />
    ))}
  </div>
);

const indexAtom = atom(0);

const JirumRankingSlider = ({ config, isMobile }: { config: SwiperOptions; isMobile: boolean }) => {
  const isHydrated = useIsHydrated();

  const {
    data: { rankingProducts },
  } = useSuspenseQuery(ProductQueries.ranking());

  const [index, setIndex] = useAtom(indexAtom);
  const swiperRef = useRef<SwiperClass>(null);
  const [isInit, setIsInit] = useState(false);

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
        <motion.div
          className={cn('pc:max-w-slider-max w-full overflow-visible')}
          initial={{ opacity: 0 }}
          animate={{ opacity: canRender ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Swiper
            {...config}
            onRealIndexChange={handleIndexChange}
            onAfterInit={handleAfterInit}
            initialSlide={index + (isMobile ? 0 : (config.slidesPerView as number) - 1)}
          >
            {rankingProducts.map((product, i) => (
              <SwiperSlide
                className={cn('pc:pb-6 pb-5', !isInit && 'pc:pb-1.5')}
                key={product.id}
                style={{ width: isMobile ? '240px' : 'calc(100% / 4)' }}
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
              className="absolute inset-0 bottom-auto z-10 animate-pulse"
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
