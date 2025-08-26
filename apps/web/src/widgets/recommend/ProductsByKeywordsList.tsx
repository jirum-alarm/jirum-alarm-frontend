'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { useDevice } from '@/hooks/useDevice';

import { KeywordProductOrderType, OrderOptionType } from '@shared/api/gql/graphql';

import { ProductQueries } from '@entities/product';

import { CarouselProductList } from '@features/products/carousel';

interface ProductByKeywordsListProps {
  keyword: string;
}

const ProductsByKeywordsList = ({ keyword }: ProductByKeywordsListProps) => {
  const { device } = useDevice();
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
    <CarouselProductList products={productsByKeyword} type={device.isMobile ? 'mobile' : 'pc'} />
  );
};

export default ProductsByKeywordsList;
