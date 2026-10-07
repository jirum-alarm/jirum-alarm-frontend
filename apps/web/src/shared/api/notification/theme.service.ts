import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

// ponytail: codegen 타입 생기기 전(dev-api 미배포)에도 빌드되도록 TypedDocumentString + 인라인 타입.
// develop 배포 후 graphql() 로 치환 가능(동작 동일). product.service.ts 의 ClusteredProduct 패턴과 동일.

export interface ThemeWithKeywords {
  id: number;
  name: string;
  description: string;
  /** URL slug(/themes/{slug}). 없는 테마는 id 로 링크 — themePath() */
  slug: string | null;
  emoji: string | null;
  representativeKeywords: string[];
  /** 딜 제목에서 찾는 키워드 전부(등록 순 — 대표 키워드가 앞) */
  keywords: string[];
  subscriberCount: number;
  /** 지난 7일 이 묶음을 구독했다면 받았을 알림 수 (반응 좋은 딜만, 하루 최대 3건) */
  weeklyAlertCount: number;
}

export interface ThemeLiveDeal {
  // 기존 상품 카드(ListProductCard, ProductCardType) 재사용 위해 동일 필드 셋으로 맞춤.
  id: string;
  title: string;
  thumbnail: string | null;
  price: string | null;
  postedAt: string;
  categoryId: number | null;
  isEnd: boolean | null;
  isHot: boolean | null;
  hotDealType: string | null;
  mallName: string | null;
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
      slug
      emoji
      representativeKeywords
      keywords
      subscriberCount
      weeklyAlertCount
    }
  }
`);

// 상세 무한 스크롤 — 기간 제한 없이 "받았을 알림"을 before 커서(앞 페이지 마지막 딜 postedAt ms)로.
const QueryNotificationThemeDeals = new TypedDocumentString<
  { notificationThemeDeals: ThemeLiveDeal[] },
  { themeId: number; before?: number; limit: number }
>(`
  query QueryNotificationThemeDeals($themeId: Int!, $before: Float, $limit: Int!) {
    notificationThemeDeals(themeId: $themeId, before: $before, limit: $limit) {
      id
      title
      thumbnail
      price
      postedAt
      categoryId
      isEnd
      isHot
      hotDealType
      mallName
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

/**
 * 테마 상세 URL. slug 가 canonical 이고, slug 없는 테마만 id 로.
 * 인코딩은 리다이렉트 Location 헤더(ASCII 만 허용) 때문 — 비ASCII slug 가 들어오면 500 이 난다.
 */
export const themePath = (theme: Pick<ThemeWithKeywords, 'id' | 'slug'>) =>
  `/themes/${encodeURIComponent(theme.slug ?? theme.id)}`;

export class ThemeService {
  static async getThemes() {
    return execute(QueryNotificationThemes).then((res) => res.data.notificationThemes);
  }

  /** 서버(상세 라우트·메타데이터)용 — 공개 쿼리라 cookies() 없이 5분 data cache. */
  static async getThemesPublic() {
    return execute(QueryNotificationThemes, undefined, { public: true, revalidate: 300 }).then(
      (res) => res.data.notificationThemes,
    );
  }

  static async getDeals(themeId: number, before: number | undefined, limit: number) {
    return execute(QueryNotificationThemeDeals, { themeId, before, limit }).then(
      (res) => res.data.notificationThemeDeals,
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
