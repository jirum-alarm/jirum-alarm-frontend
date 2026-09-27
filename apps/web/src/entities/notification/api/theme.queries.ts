import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';

export const ThemeQueries = {
  all: () => ['notification-theme'],
  themes: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'list'],
      queryFn: () => ThemeService.getThemes(),
    }),
  // 상세 무한 스크롤. 페이지가 꽉 차면(limit 개) 다음 offset 이 있다고 본다.
  deals: (themeId: number, limit = 20) =>
    infiniteQueryOptions({
      queryKey: [...ThemeQueries.all(), 'deals', themeId, limit],
      queryFn: ({ pageParam }) => ThemeService.getDeals(themeId, pageParam, limit),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        lastPage.length === limit ? pages.length * limit : undefined,
    }),
  mySubscribedIds: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'my-subscribed'],
      queryFn: () => ThemeService.getMySubscribedThemeIds(),
      staleTime: 0, // SSR에서 빈 배열로 캐싱되면 클라이언트가 re-fetch 안 함 → 항상 fresh fetch
    }),
};
