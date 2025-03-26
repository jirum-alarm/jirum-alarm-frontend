'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Swiper, SwiperSlide } from 'swiper/react';

import { ProductQueries } from '@/entities/product';
import { ProductImageCard, useCollectProduct } from '@/features/products';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

interface ProductImageCardListProps {
  keyword: string;
}

const ProductImageCardList = ({ keyword }: ProductImageCardListProps) => {
  const collectProduct = useCollectProduct();
  const {
    data: { productsByKeyword },
  } = useSuspenseQuery(
    ProductQueries.productsByKeywords({
      limit: 10,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );
  return (
    <div>
      <Swiper
        spaceBetween={12}
        slidesPerView={2.5}
        breakpoints={{
          640: { slidesPerView: 3.5 },
        }}
      >
        {productsByKeyword.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductImageCard
              key={product.id}
              type="hotDeal"
              product={product}
              collectProduct={collectProduct}
              logging={{ page: 'HOME' }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProductImageCardList;
