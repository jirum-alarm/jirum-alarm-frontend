'use client';

import 'swiper/css';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Swiper, SwiperClass, SwiperSlide, useSwiper } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/lib/cn';

import { ProductCardType } from '../type';

import CarouselProductCard from './CarouselProductCard';

interface CarouselProductListProps {
  products: ProductCardType[];
  itemWidth?: string;
  maxItems?: number;
  nested?: boolean;
}

function CarouselProductList({ products, maxItems, nested = false }: CarouselProductListProps) {
  const { device } = useDevice();

  const [isInit, setIsInit] = useState(false);
  const parentSwiper = useSwiper();

  const swiperRef = useRef<SwiperClass>(null);

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
      className="pc:my-7 -mx-5"
      {...SWIPER_OPTIONS}
      nested={nested}
      onAfterInit={handleAfterInit}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {itemsToShow.map((product, i) => (
        <SwiperSlide
          key={product.id || i}
          className={cn(!isInit && 'pc:pr-6 pc:first:pl-0 pr-3 first:pl-5')}
          style={{ width: 'fit-content' }}
        >
          <CarouselProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default CarouselProductList;
