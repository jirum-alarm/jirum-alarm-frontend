import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { CategoryQueries, getCategoriesForUser } from '@/entities/category';
import { ProductQueries } from '@/entities/product';

import { rankingQueryVariables } from '../../lib/rankingQuery';

import { TrendingContainer } from '.';

const TRENDING_ITEMS_LIMIT = 50;
/** ItemList 에 싣는 상위 개수. 목록 전체(50)를 다 실을 이유는 없다 — 순위의 머리만. */
const ITEM_LIST_LIMIT = 20;

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
  const category = isAllTab ? null : categories.find((c) => c.id === tab);
  const rankingQuery = ProductQueries.products(
    rankingQueryVariables(isAllTab ? null : tab, TRENDING_ITEMS_LIMIT),
  );
  if (isAllTab || category) {
    // 기다린다 — 순위 목록을 ItemList 로도 내보내려면 서버가 결과를 알아야 한다. prefetchQuery 는 던지지 않아
    // 실패해도 화면은 예전처럼 클라이언트가 다시 받는다.
    await queryClient.prefetchQuery(rankingQuery);
  }
  const ranked = queryClient.getQueryData(rankingQuery.queryKey)?.products ?? [];
  const listName = isAllTab ? '핫딜 랭킹' : `${category?.name ?? ''} 핫딜 랭킹`.trim();
  const itemListLd =
    ranked.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: listName,
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          itemListElement: ranked.slice(0, ITEM_LIST_LIMIT).map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `${METADATA_SERVICE_URL}/products/${p.id}`,
          })),
        }
      : null;

  return (
    <>
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <HydrationBoundary state={dehydrate(queryClient)}>
        <TrendingContainer initialTab={tab} />
      </HydrationBoundary>
    </>
  );
};

export default TrendingContainerServer;
