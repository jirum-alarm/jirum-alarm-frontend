'use client';

import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import React, { Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ProductQueries } from '@/entities/product';
import { ProductImageCard } from '@/features/products';
import { ProductQuery, ThumbnailType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';

export default function PopularProducts({
  product,
}: {
  product: NonNullable<ProductQuery['product']>;
}) {
  const { mutate } = useMutation({ mutationFn: ProductService.collectProduct });
  const result = useSuspenseQuery(
    ProductQueries.products({
      limit: 20,
      categoryId: product.categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
    }),
  );
  const products = result?.data?.products;

  if (!products?.length) {
    return null;
  }

  return (
    <section>
      <h2 className="pb-5 font-semibold text-gray-900">
        ‘{product.categoryName || '기타'}’에서 인기있는 상품
      </h2>
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
                  collectProduct={(productId: number) => mutate({ productId })}
                  logging={{ page: 'DETAIL' }}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </Suspense>
    </section>
  );
}
