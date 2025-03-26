'use client';

import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';

import { EVENT } from '@/constants/mixpanel';
import { ProductImageCard, useCollectProduct } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import { QueryCommunityRandomRankingProductsQuery } from '@/shared/api/gql/graphql';

import 'swiper/css';

export default function RecommendationProduct({
  hotDeals,
  logging,
}: {
  hotDeals: IProduct[] | QueryCommunityRandomRankingProductsQuery['communityRandomRankingProducts'];
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
