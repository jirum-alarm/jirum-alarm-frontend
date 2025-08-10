'use client';

import 'swiper/css';

import { useRef } from 'react';
import { Swiper, SwiperClass, SwiperSlide, useSwiper } from 'swiper/react';
import { SwiperOptions } from 'swiper/types';

import { ProductCardType } from '../type';

import CarouselProductCard from './CarouselProductCard';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 0,
  edgeSwipeThreshold: 100,
  preventClicks: true,
  preventClicksPropagation: true,
  touchStartForcePreventDefault: true,
};

interface CarouselProductListProps {
  products: ProductCardType[];
  itemWidth?: string;
  type?: 'product' | 'hotDeal';
  maxItems?: number;
  nested?: boolean;
}

function CarouselProductList({
  products,
  type,
  maxItems,
  nested = false,
}: CarouselProductListProps) {
  const parentSwiper = useSwiper();

  const swiperRef = useRef<SwiperClass>(null);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
  };

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Swiper
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
          className="pr-3 last:pr-0 pc:pr-6"
          style={{ width: 'fit-content' }}
        >
          <CarouselProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default CarouselProductList;
