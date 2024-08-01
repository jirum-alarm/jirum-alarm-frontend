'use client';

import { IProduct } from '@/graphql/interface';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import React from 'react';
import { ProductImageCard, useCollectProduct } from '@/features/products';
import { EVENT } from '@/constants/mixpanel';

export default function PopularProducts({
  product,
  products,
  logging,
}: {
  product: IProduct;
  products: IProduct[];
  logging: { page: keyof typeof EVENT.PAGE };
}) {
  const collectProduct = useCollectProduct();

  return (
    <section>
      <h2 className="pb-5 font-semibold text-gray-900">
        ‘{product.category || '기타'}’에서 인기있는 상품
      </h2>
      <div
        onTouchStartCapture={(e) => {
          e.stopPropagation();
        }}
        onTouchMoveCapture={(e) => {
          e.stopPropagation();
        }}
      >
        <Swiper
          spaceBetween={12}
          slidesPerView={2.5}
          breakpoints={{
            300: { slidesPerView: 2.7 },
            450: { slidesPerView: 3.7 },
          }}
        >
          {products?.map((product, i) => (
            <SwiperSlide key={i}>
              <ProductImageCard
                product={product}
                collectProduct={collectProduct}
                logging={{ page: logging.page }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
