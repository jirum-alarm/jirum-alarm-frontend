'use client';

import { useSuspenseInfiniteQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';

import {
  QueryExpiringSoonHotDealProductsArgs,
  QueryProductsByKeywordQueryVariables,
} from '@/shared/api/gql/graphql';
import { ProductListQueryVariables } from '@/shared/api/product';
import { LoadingSpinner } from '@/shared/ui/common/icons';

import { ProductQueries } from '@/entities/product';
import ProductGridList from '@/entities/product-list/ui/grid/ProductGridList';
import { getPromotionQueryOptions } from '@/entities/promotion/lib/getPromotionQueryOptions';
import { ContentPromotionSection } from '@/entities/promotion/model/types';

interface CurationProductListProps {
  section: ContentPromotionSection;
}

const LIMIT = 20;

const EmptyState = () => <div className="py-10 text-center text-gray-500">상품이 없습니다.</div>;

const ByKeyword = ({ section }: CurationProductListProps) => {
  const queryVariables: QueryProductsByKeywordQueryVariables = {
    ...(section.dataSource.variables as QueryProductsByKeywordQueryVariables),
    limit: LIMIT,
  };

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProductsByKeywords(queryVariables),
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

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <ProductGridList products={products} />
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

const ByProducts = ({ section }: CurationProductListProps) => {
  const queryVariables: ProductListQueryVariables = {
    ...(section.dataSource.variables as ProductListQueryVariables),
    limit: LIMIT,
  };

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteProducts(queryVariables),
  );

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const products = useMemo(() => data.pages.flatMap(({ products }) => [...products]), [data.pages]);

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <ProductGridList products={products} />
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

const ByExpiringSoon = ({ section }: CurationProductListProps) => {
  const queryVariables: QueryExpiringSoonHotDealProductsArgs = {
    ...(section.dataSource.variables as QueryExpiringSoonHotDealProductsArgs),
    limit: LIMIT,
  };

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    ProductQueries.infiniteExpiringSoonHotDealProducts(queryVariables),
  );

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  const products = useMemo(
    () => data.pages.flatMap(({ expiringSoonHotDealProducts }) => [...expiringSoonHotDealProducts]),
    [data.pages],
  );

  if (products.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <ProductGridList products={products} />
      <div className="flex w-full items-center justify-center py-6" ref={ref}>
        {isFetchingNextPage && <LoadingSpinner />}
      </div>
    </>
  );
};

const ByHotDeal = ({ section }: CurationProductListProps) => {
  const sectionWithLimit = {
    ...section,
    dataSource: {
      ...section.dataSource,
      variables: {
        ...section.dataSource.variables,
        limit: LIMIT,
      },
    },
  };

  const queryOptions = getPromotionQueryOptions(sectionWithLimit) as ReturnType<
    typeof ProductQueries.hotDealRankingProducts
  >;
  const { data } = useSuspenseQuery(queryOptions);
  const products = (data as any).hotDealRankingProducts ?? [];

  if (products.length === 0) {
    return <EmptyState />;
  }

  return <ProductGridList products={products} />;
};

const CurationProductList = ({ section }: CurationProductListProps) => {
  if (section.dataSource.type !== 'GRAPHQL_QUERY') {
    return <EmptyState />;
  }

  if (section.dataSource.queryName === 'hotDealRankingProducts') {
    return <ByHotDeal section={section} />;
  }

  if (section.dataSource.queryName === 'expiringSoonHotDealProducts') {
    return <ByExpiringSoon section={section} />;
  }

  if (section.dataSource.queryName === 'productsByKeyword') {
    return <ByKeyword section={section} />;
  }

  if (section.dataSource.queryName === 'products') {
    return <ByProducts section={section} />;
  }

  return <EmptyState />;
};

export default CurationProductList;
