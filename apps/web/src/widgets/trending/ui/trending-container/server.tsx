import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/shared/lib/utils/date';

import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductQueries } from '@/entities/product';

import { TrendingContainer } from '.';

const TRENDING_ITEMS_LIMIT = 50;

//NOTE: 3 : 화장품 , 5 : 도서 , 7 : 등산레저 , 8 : 상품권 , 10 : 육아
const ExtendStartDateCategories = [3, 5, 7, 8, 10];
const adjustStartDate = (categoryId: number | null) => {
  return categoryId !== null && ExtendStartDateCategories.includes(categoryId)
    ? getDayBefore(60)
    : getDayBefore(3);
};

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
      ProductQueries.products({
        limit: TRENDING_ITEMS_LIMIT,
        orderBy: ProductOrderType.CommunityRanking,
        startDate: adjustStartDate(isAllTab ? null : tab),
        categoryId: isAllTab ? null : tab,
        orderOption: OrderOptionType.Desc,
        isEnd: false,
      }),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrendingContainer initialTab={tab} />
    </HydrationBoundary>
  );
};

export default TrendingContainerServer;
