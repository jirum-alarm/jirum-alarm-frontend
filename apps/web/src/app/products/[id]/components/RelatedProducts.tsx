'use client';

import { IProduct } from '@/graphql/interface';
import { Swiper, SwiperSlide } from 'swiper/react';
import React, { Suspense } from 'react';
import {
  ProductImageCard,
  useCollectProduct,
  useGetProductTogetherViewed,
} from '@/features/products';

export default function RelatedProducts({ product }: { product: IProduct }) {
  const collectProduct = useCollectProduct();

  const result = useGetProductTogetherViewed(+product.id);
  const products = result?.data.togetherViewedProducts;
  console.info('🚀 : RelatedProducts.tsx:16: products=', products);

  if (!products?.length) {
    return null;
  }

  return (
    <>
      <hr />
      <section>
        <h2 className="pb-5 font-semibold text-gray-900">다른 고객이 함께 본 상품</h2>
        <Suspense fallback={<div></div>}>
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
              breakpoints={{
                300: { slidesPerView: 2.7 },
                450: { slidesPerView: 3.7 },
              }}
            >
              {products?.map((product, i) => (
                <SwiperSlide key={i}>
                  <ProductImageCard
                    type="hotDeal"
                    product={product}
                    collectProduct={collectProduct}
                    logging={{ page: 'DETAIL' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Suspense>
      </section>
    </>
  );
}
