import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

// ponytail: codegen 타입 생기기 전(dev-api 미배포)에도 빌드되도록 TypedDocumentString + 인라인 타입.
// develop 배포 후 graphql() 로 치환 가능(동작 동일). product.service.ts 의 ClusteredProduct 패턴과 동일.

export interface ThemeWithKeywords {
  id: number;
  name: string;
  description: string;
  emoji: string | null;
  representativeKeywords: string[];
}

export interface ThemeLiveDeal {
  id: number;
  title: string;
  url: string;
  price: number | null;
  priceCurrency: string | null;
  thumbnail: string | null;
  provider: { nameKr: string | null } | null;
}

const QueryNotificationThemes = new TypedDocumentString<
  { notificationThemes: ThemeWithKeywords[] },
  Record<string, never>
>(`
  query QueryNotificationThemes {
    notificationThemes {
      id
      name
      description
      emoji
      representativeKeywords
    }
  }
`);

const QueryNotificationThemeLiveDeals = new TypedDocumentString<
  { notificationThemeLiveDeals: ThemeLiveDeal[] },
  { themeId: number }
>(`
  query QueryNotificationThemeLiveDeals($themeId: Int!) {
    notificationThemeLiveDeals(themeId: $themeId) {
      id
      title
      url
      price
      priceCurrency
      thumbnail
      provider {
        nameKr
      }
    }
  }
`);

const QueryMySubscribedThemeIds = new TypedDocumentString<
  { mySubscribedThemeIds: number[] },
  Record<string, never>
>(`
  query QueryMySubscribedThemeIds {
    mySubscribedThemeIds
  }
`);

const MutationSubscribeNotificationTheme = new TypedDocumentString<
  { subscribeNotificationTheme: boolean },
  { themeId: number }
>(`
  mutation MutationSubscribeNotificationTheme($themeId: Int!) {
    subscribeNotificationTheme(themeId: $themeId)
  }
`);

const MutationUnsubscribeNotificationTheme = new TypedDocumentString<
  { unsubscribeNotificationTheme: boolean },
  { themeId: number }
>(`
  mutation MutationUnsubscribeNotificationTheme($themeId: Int!) {
    unsubscribeNotificationTheme(themeId: $themeId)
  }
`);

export class ThemeService {
  static async getThemes() {
    return execute(QueryNotificationThemes).then((res) => res.data.notificationThemes);
  }

  static async getLiveDeals(themeId: number) {
    return execute(QueryNotificationThemeLiveDeals, { themeId }).then(
      (res) => res.data.notificationThemeLiveDeals,
    );
  }

  static async getMySubscribedThemeIds() {
    // 비로그인은 403(Forbidden) → 빈 배열. L1 공유 링크 비로그인 미리보기가 깨지지 않게.
    return execute(QueryMySubscribedThemeIds)
      .then((res) => res.data.mySubscribedThemeIds)
      .catch(() => [] as number[]);
  }

  static async subscribe(themeId: number) {
    return execute(MutationSubscribeNotificationTheme, { themeId }).then(
      (res) => res.data.subscribeNotificationTheme,
    );
  }

  static async unsubscribe(themeId: number) {
    return execute(MutationUnsubscribeNotificationTheme, { themeId }).then(
      (res) => res.data.unsubscribeNotificationTheme,
    );
  }
}
