import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

import { ProductListQueries } from '@/entities/product-list';

import { GridProductList, GridProductListSkeleton } from '@/entities/product-list';

interface ProductImageCardListProps {
  keyword: string;
  limit: number;
}

const RecommendProductList = ({ keyword, limit }: ProductImageCardListProps) => {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductListQueries.infiniteProductsByKeywords({
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
      <GridProductList products={products} />
      <div className="flex w-full items-center justify-center bg-white py-6" ref={ref}>
        {isFetchingNextPage && <GridProductListSkeleton length={10} />}
      </div>
    </>
  );
};

export default RecommendProductList;
