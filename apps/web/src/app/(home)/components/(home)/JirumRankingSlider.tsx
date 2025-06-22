'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ProductQueries } from '@/entities/product';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import useScreen from '@/hooks/useScreenSize';
import { cn } from '@/lib/cn';

import { JirumRankingSliderSkeleton } from './JirumRankingContainer';

const SLIDE_SIZE = 4;

const SLIDER_CONFIG_MOBILE: SwiperOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  loop: true,
  lazyPreloadPrevNext: 1,
  lazyPreloaderClass: 'swiper-lazy-preloader',
} as const;

const SLIDER_CONFIG_DESKTOP: SwiperOptions = {
  slidesPerView: SLIDE_SIZE,
  centeredSlides: false,
  loop: false,
  slidesPerGroup: SLIDE_SIZE,
} as const;

const SliderDots = ({ total, activeIndex }: { total: number; activeIndex: number }) => (
  <div
    className="mx-auto mt-3 flex h-[20px] w-full items-center justify-center lg:w-[100px]"
    role="tablist"
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={activeIndex === i}
        aria-label={`슬라이드 ${i + 1}`}
        className={cn(`h-[3px] w-[3px] bg-gray-400 lg:grow lg:bg-gray-500`, {
          'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600 lg:w-[32px] lg:bg-gray-300':
            activeIndex === i,
        })}
      />
    ))}
  </div>
);

const JirumRankingSlider = ({ isMobile }: { isMobile: boolean }) => {
  const { lg } = useScreen();

  const isDesktop = useMemo(() => !isMobile && lg, [isMobile, lg]);

  const {
    data: { rankingProducts },
  } = useSuspenseQuery(ProductQueries.ranking());

  const [activeIndex, setActiveIndex] = useState(0);
  const [isInit, setIsInit] = useState(false);

  const collectProduct = useCollectProduct();

  const handleAfterInit = () => {
    setIsInit(true);
  };

  const handleIndexChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex);
  };

  return (
    <>
      {rankingProducts.length > 0 && (
        <div key={isDesktop ? 'desktop' : 'mobile'} className="relative mt-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isInit ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Swiper
              {...(isDesktop ? SLIDER_CONFIG_DESKTOP : SLIDER_CONFIG_MOBILE)}
              onRealIndexChange={handleIndexChange}
              onAfterInit={handleAfterInit}
            >
              {rankingProducts.map((product, i) => (
                <SwiperSlide key={product.id} style={{ width: '240px', paddingBottom: '8px' }}>
                  <ProductRankingImageCard
                    activeIndex={activeIndex}
                    index={i}
                    product={product}
                    logging={{ page: 'HOME' }}
                    collectProduct={collectProduct}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
          <AnimatePresence>
            {!isInit && (
              <motion.div
                className="absolute inset-0 z-10"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <JirumRankingSliderSkeleton />
              </motion.div>
            )}
          </AnimatePresence>
          <SliderDots
            total={rankingProducts.length - (isMobile ? 0 : SLIDE_SIZE - 1)}
            activeIndex={activeIndex}
          />
        </div>
      )}
    </>
  );
};

export default JirumRankingSlider;
