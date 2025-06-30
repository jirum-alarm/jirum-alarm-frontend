'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { ProductQueries } from '@/entities/product';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

interface ProductImageCardListProps {
  keyword: string;
}

const ProductsByKeywordsList = ({ keyword }: ProductImageCardListProps) => {
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
    <HorizontalProductCarousel
      products={productsByKeyword}
      type="hotDeal"
      logging={{ page: 'HOME' }}
    />
  );
};

export default ProductsByKeywordsList;
