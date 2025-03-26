'use client';

import 'swiper/css';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { SwiperSlide, Swiper } from 'swiper/react';

import { ProductQueries } from '@/entities/product';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import { cn } from '@/lib/cn';

const SLIDER_CONFIG = {
  centeredSlides: true,
  slidesPerView: 1.5577,
  breakpoints: {
    450: { slidesPerView: 2 },
    520: { slidesPerView: 2.3 },
  },
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
  const collectProduct = useCollectProduct();

  const slides = useMemo(
    () =>
      rankingProducts.map((product, i) => (
        <SwiperSlide key={product.id} className="pb-2">
          <ProductRankingImageCard
            activeIndex={activeIndex}
            index={i}
            product={product}
            logging={{ page: 'HOME' }}
            collectProduct={collectProduct}
          />
        </SwiperSlide>
      )),
    [rankingProducts, activeIndex, collectProduct],
  );

  if (!rankingProducts?.length) {
    return <div>No products available</div>;
  }

  return (
    <div>
      <Swiper {...SLIDER_CONFIG} onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}>
        {slides}
      </Swiper>
      <SliderDots total={rankingProducts.length} activeIndex={activeIndex} />
    </div>
  );
};

export default JirumRankingSlider;
