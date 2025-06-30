'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ArrowLeft, ArrowRight } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import { cn } from '@/lib/cn';

import { JirumRankingSliderSkeleton as DesktopSliderSkeleton } from './desktop/JirumRankingSliderSkeleton';
import { JirumRankingSliderSkeleton as MobileSliderSkeleton } from './mobile/JirumRankingSliderSkeleton';

const SliderDots = ({
  total,
  activeIndex,
  isMobile,
}: {
  total: number;
  activeIndex: number;
  isMobile: boolean;
}) => (
  <div
    className={cn('mx-auto flex h-[20px] w-full items-center justify-center', {
      'w-[100px]': !isMobile,
    })}
    role="tablist"
  >
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        role="tab"
        aria-selected={activeIndex === i}
        aria-label={`슬라이드 ${i + 1}`}
        className={cn(`h-[3px] w-[3px] bg-gray-400`, {
          'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600': activeIndex === i,
          'grow bg-gray-500': !isMobile,
          'w-[32px] bg-gray-300': !isMobile && activeIndex === i,
        })}
      />
    ))}
  </div>
);

const JirumRankingSlider = ({ config, isMobile }: { config: SwiperOptions; isMobile: boolean }) => {
  const {
    data: { rankingProducts },
  } = useSuspenseQuery(ProductQueries.ranking());

  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState<SwiperClass | null>(null);

  const collectProduct = useCollectProduct();

  const isInit = useMemo(() => !!swiper, [swiper]);

  const handleAfterInit = (swiper: SwiperClass) => {
    setSwiper(swiper);
  };

  const handleIndexChange = (swiper: SwiperClass) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleSlidePrev = () => {
    swiper?.slidePrev();
  };

  const handleSlideNext = () => {
    swiper?.slideNext();
  };

  return (
    <>
      {rankingProducts.length > 0 && (
        <>
          <div className="relative flex w-full items-center gap-x-5 gap-y-3">
            {!isMobile && (
              <button
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
                onClick={handleSlidePrev}
                disabled={activeIndex === 0}
              >
                <ArrowLeft className="mr-1 size-8 text-white" color="white" />
              </button>
            )}
            <motion.div
              className={cn('w-full overflow-visible', {
                'max-w-slider-max': !isMobile,
              })}
              initial={{ opacity: 0 }}
              animate={{ opacity: isInit ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Swiper
                {...config}
                onRealIndexChange={handleIndexChange}
                onAfterInit={handleAfterInit}
              >
                {rankingProducts.map((product, i) => (
                  <SwiperSlide
                    className={cn('pb-5', {
                      'pb-6': !isMobile,
                    })}
                    key={product.id}
                    style={{ width: isMobile ? '240px' : '234px' }}
                  >
                    <ProductRankingImageCard
                      isMobile={isMobile}
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
            {!isMobile && (
              <button
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gray-800 disabled:opacity-0"
                onClick={handleSlideNext}
                disabled={activeIndex === rankingProducts.length - (isMobile ? 0 : 4)}
              >
                <ArrowLeft className="ml-1 size-8 -scale-x-100 text-white" color="white" />
              </button>
            )}
            {/* <div className="absolute inset-0 z-10 animate-pulse">
              {isMobile ? <MobileSliderSkeleton /> : <DesktopSliderSkeleton />}
            </div> */}

            <AnimatePresence>
              {!isInit && (
                <motion.div
                  className="absolute inset-0 bottom-auto z-10 animate-pulse"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isMobile ? <MobileSliderSkeleton /> : <DesktopSliderSkeleton />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <SliderDots
            total={rankingProducts.length - (isMobile ? 0 : 3)}
            activeIndex={activeIndex}
            isMobile={isMobile}
          />
        </>
      )}
    </>
  );
};

export default JirumRankingSlider;
