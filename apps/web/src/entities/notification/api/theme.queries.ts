import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';

export const ThemeQueries = {
  all: () => ['notification-theme'],
  themes: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'list'],
      queryFn: () => ThemeService.getThemes(),
    }),
  // 상세 무한 스크롤(기간 제한 없음). 커서 = 마지막 딜의 postedAt(ms) — 서버가 그 날의 전날부터
  // 하루 단위로 읽는다. 빈 페이지 = 서버가 90일을 훑어도 더 없음 → 끝.
  deals: (themeId: number, limit = 20) =>
    infiniteQueryOptions({
      queryKey: [...ThemeQueries.all(), 'deals', themeId, limit],
      queryFn: ({ pageParam }) => ThemeService.getDeals(themeId, pageParam, limit),
      initialPageParam: undefined as number | undefined,
      getNextPageParam: (lastPage) =>
        lastPage.length ? new Date(lastPage[lastPage.length - 1].postedAt).getTime() : undefined,
    }),
  mySubscribedIds: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'my-subscribed'],
      queryFn: () => ThemeService.getMySubscribedThemeIds(),
      staleTime: 0, // SSR에서 빈 배열로 캐싱되면 클라이언트가 re-fetch 안 함 → 항상 fresh fetch
    }),
};
