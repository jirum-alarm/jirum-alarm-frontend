'use client';

import 'swiper/css';

import { SwiperOptions } from 'node_modules/swiper/types/swiper-options';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

import { EVENT } from '@/constants/mixpanel';
import { ProductImageCard } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';

const SWIPER_OPTIONS: SwiperOptions = {
  slidesPerView: 'auto',
  spaceBetween: 12,
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
  itemWidth = '120px',
  type,
  logging,
  maxItems,
  nested = false,
}: HorizontalProductCarouselProps) {
  const isHydrated = useIsHydrated();
  const swiper = useSwiper();

  const itemsToShow = maxItems ? products.slice(0, maxItems) : products;

  return (
    <Swiper
      {...SWIPER_OPTIONS}
      wrapperClass={cn({
        'flex gap-3': !isHydrated,
      })}
      nested={nested}
      onTouchStart={() => {
        if (nested) {
          swiper.allowTouchMove = false;
        }
      }}
      onTouchEnd={() => {
        if (nested) {
          swiper.allowTouchMove = true;
        }
      }}
    >
      {itemsToShow.map((product, i) => (
        <SwiperSlide key={product.id || i} style={{ width: itemWidth }}>
          <ProductImageCard product={product} type={type} logging={logging} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default HorizontalProductCarousel;
