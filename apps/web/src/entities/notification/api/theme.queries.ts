import { queryOptions } from '@tanstack/react-query';

import { ThemeService } from '@/shared/api/notification/theme.service';

export const ThemeQueries = {
  all: () => ['notification-theme'],
  themes: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'list'],
      queryFn: () => ThemeService.getThemes(),
    }),
  liveDeals: (themeId: number) =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'live-deals', themeId],
      queryFn: () => ThemeService.getLiveDeals(themeId),
      staleTime: 0, // 라이브딜은 항상 최신(상세 진입 시 실시간)
    }),
  mySubscribedIds: () =>
    queryOptions({
      queryKey: [...ThemeQueries.all(), 'my-subscribed'],
      queryFn: () => ThemeService.getMySubscribedThemeIds(),
    }),
};
