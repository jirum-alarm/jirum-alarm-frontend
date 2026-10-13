import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductQueries } from '@/entities/product';

import { rankingQueryVariables } from '../../lib/rankingQuery';

import { TrendingContainer } from '.';

const TRENDING_ITEMS_LIMIT = 50;

type Props = {
  tab: number;
};

const TrendingContainerServer = async ({ tab }: Props) => {
  const queryClient = new QueryClient();

  const { categories } = await getCategoriesForUser();
  queryClient.setQueryData(CategoryQueries.categoriesForUser().queryKey, {
    categories,
  });

  // tab 0 = '전체'(합성 카테고리). categories에 없으므로 find로만 거르면 전체 탭이 SSR 프리페치에서
  // 통째로 빠진다. 전체는 categoryId 없이(null) 프리페치한다.
  const isAllTab = tab === 0;
  if (isAllTab || categories.find((c) => c.id === tab)) {
    queryClient.prefetchQuery(
      ProductQueries.products(rankingQueryVariables(isAllTab ? null : tab, TRENDING_ITEMS_LIMIT)),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrendingContainer initialTab={tab} />
    </HydrationBoundary>
  );
};

export default TrendingContainerServer;
