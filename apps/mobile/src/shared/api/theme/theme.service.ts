import {
  MutationSubscribeNotificationTheme,
  MutationUnsubscribeNotificationTheme,
  QueryMySubscribedThemeIds,
  QueryNotificationThemeLiveDeals,
  QueryNotificationThemes,
} from '@/graphql/mypage';
import {HttpClient} from '@/shared/lib/client';

export type ThemeWithKeywords = {
  id: string;
  name: string;
  description: string;
  emoji?: string | null;
  representativeKeywords: string[];
};

export type ThemeLiveDeal = {
  id: string;
  title: string;
  thumbnail?: string | null;
  price?: string | null;
  postedAt: string;
  categoryId: number;
  isEnd?: boolean | null;
  isHot?: boolean | null;
  hotDealType?: string | null;
  mallName?: string | null;
  provider?: {nameKr?: string | null} | null;
};

/** 알림 묶음(테마). web `shared/api/notification/theme.service.ts` */
export class ThemeService {
  static async getThemes() {
    const res = await HttpClient.withNoAuth().execute(QueryNotificationThemes);
    return (res.data?.notificationThemes ?? []) as ThemeWithKeywords[];
  }

  static async getLiveDeals(themeId: number) {
    const res = await HttpClient.withNoAuth().execute(
      QueryNotificationThemeLiveDeals,
      {themeId},
    );
    return (res.data?.notificationThemeLiveDeals ?? []) as ThemeLiveDeal[];
  }

  /**
   * 내 구독 목록. web 은 비로그인 403 을 빈 배열로 삼킨다 —
   * 앱은 로그인 뒤에만 도달하지만 토큰이 방금 만료된 순간이 있어 같이 삼킨다
   * (여기서 던지면 목록 화면이 통째로 에러가 된다).
   */
  static async getMySubscribedThemeIds(): Promise<number[]> {
    try {
      const res = await HttpClient.withAccessToken().execute(
        QueryMySubscribedThemeIds,
      );
      return res.data?.mySubscribedThemeIds ?? [];
    } catch {
      return [];
    }
  }

  static async subscribe(themeId: number) {
    const res = await HttpClient.withAccessToken().execute(
      MutationSubscribeNotificationTheme,
      {themeId},
    );
    return res.data?.subscribeNotificationTheme ?? false;
  }

  static async unsubscribe(themeId: number) {
    const res = await HttpClient.withAccessToken().execute(
      MutationUnsubscribeNotificationTheme,
      {themeId},
    );
    return res.data?.unsubscribeNotificationTheme ?? false;
  }
}
