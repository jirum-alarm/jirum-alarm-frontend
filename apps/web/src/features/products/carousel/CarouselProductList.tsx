'use client';

import 'swiper/css';

import { useMemo, useRef, useState } from 'react';
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
      slidesOffsetBefore: type === 'pc' ? 0 : 20,
    };
  }, [type]);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
    setIsInit(true);
  };

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Swiper
      className="pc:my-7"
      {...SWIPER_OPTIONS}
      nested={nested}
      onAfterInit={handleAfterInit}
      onTouchStart={() => {
        if (nested) {
          parentSwiper.allowTouchMove = false;
        }
      }}
      onTouchEnd={() => {
        if (nested) {
          parentSwiper.allowTouchMove = true;
        }
      }}
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
