import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { cookies } from 'next/headers';

import { getAccessToken } from '@/app/actions/token';
import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductQueries } from '@/entities/product';
import { CategoryService } from '@/shared/api/category';
import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';
import { getDayBefore } from '@/util/date';

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
  const token = await getAccessToken();

  const queryClient = new QueryClient();

  const { categories } = await getCategoriesForUser(!!token);
  queryClient.setQueryData(CategoryQueries.categoriesForUser(!!token).queryKey, {
    categories,
  });

  if (categories.find((c) => c.id === tab)) {
    await queryClient.prefetchQuery(
      ProductQueries.productsServer({
        limit: TRENDING_ITEMS_LIMIT,
        orderBy: ProductOrderType.CommunityRanking,
        startDate: adjustStartDate(tab),
        categoryId: tab,
        orderOption: OrderOptionType.Desc,
        isEnd: false,
      }),
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TrendingContainer initialTab={tab} isUserLogin={!!token} />
    </HydrationBoundary>
  );
};

export default TrendingContainerServer;
