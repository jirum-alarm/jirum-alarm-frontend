'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ProductQueries } from '@/entities/product';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import { cn } from '@/lib/cn';

import { JirumRankingSliderSkeleton } from './JirumRankingContainer';

const SLIDER_CONFIG: SwiperOptions = {
  slidesPerView: 'auto',
  centeredSlides: true,
  loop: true,
  lazyPreloadPrevNext: 1,
  lazyPreloaderClass: 'swiper-lazy-preloader',
} as const;

const SliderDots = ({ total, activeIndex }: { total: number; activeIndex: number }) => (
  <div className="mt-3 flex h-[20px] w-full items-center justify-center" role="tablist">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={activeIndex === i}
        aria-label={`슬라이드 ${i + 1}`}
        className={cn(`h-[3px] w-[3px] bg-gray-400`, {
          'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600': activeIndex === i,
        })}
      />
    ))}
  </div>
);

const JirumRankingSlider = () => {
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
        <div className="relative mt-2">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isInit ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Swiper
              {...SLIDER_CONFIG}
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
          <SliderDots total={rankingProducts.length} activeIndex={activeIndex} />
        </div>
      )}
    </>
  );
};

export default JirumRankingSlider;
