'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import { KeywordProductOrderType, OrderOptionType } from '@/shared/api/gql/graphql';

import { ProductGridList, ProductListQueries } from '@/entities/product-list';
import { ContentPromotionSection } from '@/entities/promotion';

interface CurationProductListProps {
  section: ContentPromotionSection;
}

const LIMIT = 20;

const CurationProductListByKeyword = ({
  variables,
}: {
  variables: {
    keyword: string;
    orderBy: KeywordProductOrderType;
    orderOption: OrderOptionType;
    limit: number;
  };
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ProductListQueries.infiniteProductsByKeywords(variables),
  );

  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.productsByKeyword ?? []);
  }, [data]);

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return null;
  }

  if (!products || products.length === 0) {
    return <div className="py-10 text-center text-gray-500">상품이 없습니다.</div>;
  }

  return (
    <>
      <ProductGridList products={products} />
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          )}
        </div>
      )}
    </>
  );
};

const CurationProductListByProducts = ({
  variables,
}: {
  variables: {
    limit: number;
  };
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ProductListQueries.infiniteProducts(variables),
  );

  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.products ?? []);
  }, [data]);

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  if (isLoading) {
    return null;
  }

  if (!products || products.length === 0) {
    return <div className="py-10 text-center text-gray-500">상품이 없습니다.</div>;
  }

  return (
    <>
      <ProductGridList products={products} />
      {hasNextPage && (
        <div ref={ref} className="flex justify-center py-8">
          {isFetchingNextPage && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
          )}
        </div>
      )}
    </>
  );
};

const CurationProductList = ({ section }: CurationProductListProps) => {
  const { dataSource } = section;
  const { queryName, variables } = dataSource;

  if (queryName === 'productsByKeyword') {
    return (
      <CurationProductListByKeyword
        variables={{
          keyword: variables.keyword,
          orderBy: variables.orderBy,
          orderOption: variables.orderOption,
          limit: LIMIT,
        }}
      />
    );
  }

  return <CurationProductListByProducts variables={{ ...variables, limit: LIMIT }} />;
};

export default CurationProductList;
