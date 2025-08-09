import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { LoadingSpinner } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import ProductGridList from '@/features/products/components/grid/ProductGridList';
import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

interface ProductImageCardListProps {
  keyword: string;
  limit: number;
}

const RecommendProductList = ({ keyword, limit }: ProductImageCardListProps) => {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProductsByKeywords({
      limit,
      keyword,
      orderBy: KeywordProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
  );
  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const products = useMemo(
    () => data.pages.flatMap(({ productsByKeyword }) => [...productsByKeyword]),
    [data.pages],
  );

  return (
    <>
      <ProductGridList products={products} loggingPage={'RECOMMEND'} />
      <div className="flex w-full items-center justify-center bg-white py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

export default RecommendProductList;
