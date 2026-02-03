'use client';

import 'swiper/css';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide, useSwiper } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { useDevice } from '@/shared/hooks/useDevice';
import { cn } from '@/shared/lib/cn';

import { ProductCardType } from '@/entities/product-list/model/types';

import DoubleRowProductCard from '../card/DoubleRowProductCard';

interface DoubleRowCarouselProductListProps {
  products: ProductCardType[];
  itemWidth?: string;
  maxItems?: number;
  nested?: boolean;
}

const DoubleRowCarouselProductList = ({
  products,
  itemWidth,
  maxItems,
  nested = false,
}: DoubleRowCarouselProductListProps) => {
  const { device } = useDevice();
  const [isInit, setIsInit] = useState(false);
  const parentSwiper = useSwiper();
  const swiperRef = useRef<SwiperClass>(null);

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  const pairedProducts = useMemo(() => {
    const chunks: ProductCardType[][] = [];
    for (let index = 0; index < itemsToShow.length; index += 2) {
      chunks.push(itemsToShow.slice(index, index + 2));
    }
    return chunks;
  }, [itemsToShow]);

  const SWIPER_OPTIONS: SwiperOptions = useMemo(() => {
    return {
      slidesPerView: 'auto',
      spaceBetween: device.isMobile ? 12 : 24,
      edgeSwipeThreshold: 100,
      preventClicks: true,
      preventClicksPropagation: true,
      touchStartForcePreventDefault: true,
      slidesOffsetBefore: device.isMobile ? 20 : 0,
      slidesOffsetAfter: device.isMobile ? 20 : 0,
    };
  }, [device.isMobile]);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
    setIsInit(true);
  };

  const handleTouchStart = useCallback(() => {
    if (nested && parentSwiper) {
      parentSwiper.allowTouchMove = false;
    }
  }, [nested, parentSwiper]);

  const handleTouchEnd = useCallback(() => {
    if (nested && parentSwiper) {
      parentSwiper.allowTouchMove = true;
    }
  }, [nested, parentSwiper]);

  return (
    <Swiper
      className="pc:my-7 -mx-5"
      {...SWIPER_OPTIONS}
      nested={nested}
      onAfterInit={handleAfterInit}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {pairedProducts.map((chunk, index) => (
        <SwiperSlide
          key={`double-row-${index}`}
          className={cn(!isInit && 'pc:pr-6 pc:first:pl-0 pr-3 first:pl-5')}
          style={{ width: itemWidth ?? '85%' }}
        >
          <div className="flex flex-col gap-4">
            {chunk.map((product) => (
              <DoubleRowProductCard key={product.id} product={product} />
            ))}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default DoubleRowCarouselProductList;
