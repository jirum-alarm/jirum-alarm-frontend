'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ProductQueries } from '@/entities/product';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import { cn } from '@/lib/cn';

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

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
    containScroll: 'trimSnaps',
    skipSnaps: true,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const handler = () => {
      emblaApi.internalEngine().scrollBody.useFriction(0.73).useDuration(21);
    };

    emblaApi.on('pointerUp', handler);
    emblaApi.on('select', handler);

    requestAnimationFrame(() => {
      emblaApi.scrollTo(0, true);
    });

    return () => {
      emblaApi.off('pointerUp', handler);
      emblaApi.off('select', handler);
    };
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setActiveIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const slides = useMemo(
    () =>
      rankingProducts.map((product, i) => (
        <div key={product.id} className="w-[240px] flex-[0_0_auto] pb-2">
          <ProductRankingImageCard
            activeIndex={activeIndex}
            index={i}
            product={product}
            logging={{ page: 'HOME' }}
            collectProduct={collectProduct}
          />
        </div>
      )),
    [rankingProducts, activeIndex, collectProduct],
  );

  return (
    <>
      {rankingProducts.length > 0 && (
        <div className="mt-2">
          <div
            className="overflow-hidden will-change-transform"
            ref={emblaRef}
            onMouseMove={(e) => e.stopPropagation()}
          >
            <div
              className="flex"
              style={{
                transform: 'translate3d(calc(50% - 120px), 0px, 0px)',
              }}
            >
              {slides}
            </div>
          </div>
          <SliderDots total={rankingProducts.length} activeIndex={activeIndex} />
        </div>
      )}
    </>
  );
};

export default JirumRankingSlider;
