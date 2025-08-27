'use client';

import 'swiper/css';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide, useSwiper } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { cn } from '@/lib/cn';

import { ProductCardType } from '../type';

import CarouselProductCard from './CarouselProductCard';

interface CarouselProductListProps {
  products: ProductCardType[];
  itemWidth?: string;
  type?: 'pc' | 'mobile';
  maxItems?: number;
  nested?: boolean;
}

function CarouselProductList({
  products,
  type,
  maxItems,
  nested = false,
}: CarouselProductListProps) {
  const [isInit, setIsInit] = useState(false);
  const parentSwiper = useSwiper();

  const swiperRef = useRef<SwiperClass>(null);

  const SWIPER_OPTIONS: SwiperOptions = useMemo(() => {
    return {
      slidesPerView: 'auto',
      spaceBetween: type === 'pc' ? 24 : 12,
      edgeSwipeThreshold: 100,
      preventClicks: true,
      preventClicksPropagation: true,
      touchStartForcePreventDefault: true,
      slidesOffsetBefore: 20,
    };
  }, [type]);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
    setIsInit(true);
  };

  // Optimized touch event handlers with useCallback to prevent unnecessary re-renders
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

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Swiper
      className="pc:my-7"
      {...SWIPER_OPTIONS}
      nested={nested}
      onAfterInit={handleAfterInit}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {itemsToShow.map((product, i) => (
        <SwiperSlide
          key={product.id || i}
          className={cn(!isInit && 'pc:first:pl-5 pc:pr-6 pr-3 first:pl-5')}
          style={{ width: 'fit-content' }}
        >
          <CarouselProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default CarouselProductList;
