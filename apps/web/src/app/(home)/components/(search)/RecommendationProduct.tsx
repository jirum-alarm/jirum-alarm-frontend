'use client';

import { IProduct } from '@/graphql/interface';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import 'swiper/css';
import React from 'react';
import { ProductImageCard, useCollectProduct } from '@/features/products';
import { EVENT } from '@/constants/mixpanel';

export default function RecommendationProduct({
  hotDeals,
  logging,
}: {
  hotDeals: IProduct[];
  logging: { page: keyof typeof EVENT.PAGE };
}) {
  const hotDealCount = 10;

  const collectProduct = useCollectProduct();
  const swiper = useSwiper();

  return (
    <div>
      <Swiper
        onTouchStartCapture={(e) => {
          e.stopPropagation();
        }}
        onTouchMoveCapture={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={() => {
          swiper.allowTouchMove = false;
        }}
        onTouchEnd={() => {
          swiper.allowTouchMove = true;
        }}
        spaceBetween={12}
        slidesPerView={2.5}
        breakpoints={{
          640: { slidesPerView: 3.5 },
        }}
      >
        {hotDeals.slice(0, hotDealCount).map((hotDeal, i) => (
          <SwiperSlide key={i}>
            <ProductImageCard
              product={hotDeal}
              type="hotDeal"
              collectProduct={collectProduct}
              logging={{ page: logging.page }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
