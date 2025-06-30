'use client';

import 'swiper/css';

import { SwiperOptions } from 'node_modules/swiper/types/swiper-options';
import { useRef } from 'react';
import { Swiper, SwiperClass, SwiperSlide, useSwiper } from 'swiper/react';

import { EVENT } from '@/constants/mixpanel';
import { ProductImageCard } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 0,
  edgeSwipeThreshold: 100,
  preventClicks: true,
  preventClicksPropagation: true,
  touchStartForcePreventDefault: true,
};

interface HorizontalProductCarouselProps {
  products: IProduct[] | QueryProductsQuery['products'];
  itemWidth?: string;
  type?: 'product' | 'hotDeal';
  logging: { page: keyof typeof EVENT.PAGE };
  maxItems?: number;
  nested?: boolean;
}

function HorizontalProductCarousel({
  products,
  type,
  logging,
  maxItems,
  nested = false,
}: HorizontalProductCarouselProps) {
  const isHydrated = useIsHydrated();
  const parentSwiper = useSwiper();

  const swiperRef = useRef<SwiperClass>(null);

  const handleAfterInit = (swiper: SwiperClass) => {
    swiperRef.current = swiper;
  };

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Swiper
      {...SWIPER_OPTIONS}
      wrapperClass={cn({
        flex: !isHydrated,
      })}
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
          className="pr-3 last:pr-0 lg:pr-6"
          style={{ width: 'fit-content' }}
        >
          <ProductImageCard product={product} type={type} logging={logging} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default HorizontalProductCarousel;
