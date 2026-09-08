import {queryOptions} from '@tanstack/react-query';

import {ThemeService} from '@/shared/api/theme';

/**
 * 알림 묶음(테마). web `entities/notification/api/theme.queries.ts`
 *
 * ★네이티브 쪽 `entities/notification` 은 알림함 소유라 여기 두지 않는다
 * (web 은 한 폴더에 섞여 있다).
 */
export class ThemeQueries {
  static readonly keys = {
    all: ['notification-theme'] as const,
    list: () => [...ThemeQueries.keys.all, 'list'] as const,
    liveDeals: (themeId: number) =>
      [...ThemeQueries.keys.all, 'live-deals', themeId] as const,
    mySubscribed: () => [...ThemeQueries.keys.all, 'my-subscribed'] as const,
  };

  static themes() {
    return queryOptions({
      queryKey: ThemeQueries.keys.list(),
      queryFn: ThemeService.getThemes,
    });
  }

  /** 라이브딜은 항상 최신(상세 진입 시 실시간). web 도 staleTime 0. */
  static liveDeals(themeId: number) {
    return queryOptions({
      queryKey: ThemeQueries.keys.liveDeals(themeId),
      queryFn: () => ThemeService.getLiveDeals(themeId),
      staleTime: 0,
    });
  }

  static mySubscribedIds() {
    return queryOptions({
      queryKey: ThemeQueries.keys.mySubscribed(),
      queryFn: ThemeService.getMySubscribedThemeIds,
      staleTime: 0,
    });
  }
}
