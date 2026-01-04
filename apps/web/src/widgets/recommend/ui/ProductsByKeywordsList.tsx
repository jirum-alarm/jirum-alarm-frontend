'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';
import { useDevice } from '@/shared/hooks/useDevice';

import { ProductListQueries } from '@/entities/product-list';

import { CarouselProductList } from '@/entities/product-list';

interface ProductByKeywordsListProps {
  keyword: string;
}

const ProductsByKeywordsList = ({ keyword }: ProductByKeywordsListProps) => {
  const {
    data: { productsByKeyword },
  } = useSuspenseQuery(
    ProductListQueries.productsByKeywords({
      limit: 10,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );

  return <CarouselProductList products={productsByKeyword} />;
};

export default ProductsByKeywordsList;
