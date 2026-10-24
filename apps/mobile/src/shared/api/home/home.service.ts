import {
  QueryCommunityProviders,
  QueryCommunityRandomRankingProducts,
  QueryExpiringSoonHotDealProducts,
  QueryGuestRecommendedHotDeals,
  QueryHomeProducts,
  QueryHotDealFeedProducts,
  QueryHotDealRankingProducts,
  QueryMallGroups,
  QueryProductsByKeyword,
  QueryRecommendedNotificationKeywords,
  QueryTossCategoryLabels,
  QueryTossProducts,
} from '@/graphql/home';
import {
  MutationRecordAdClick,
  MutationRecordAdImpressions,
  QueryActiveAds,
} from '@/graphql/ad';
import {HttpClient} from '@/shared/lib/client';
import {TypedDocumentString} from '@/shared/api/gql/graphql.ts';
import type {ServerHomeSection} from '@/shared/api/home/server-home-section';
import type {
  ActiveAdsQueryVariables,
  CommunityRandomRankingProductsQueryVariables,
  ExpiringSoonHotDealProductsQueryVariables,
  GuestRecommendedHotDealsQueryVariables,
  HomeProductsByKeywordQueryVariables,
  HomeProductsQueryVariables,
  HotDealFeedProductsQueryVariables,
  HotDealRankingProductsQueryVariables,
  RecordAdClickMutationVariables,
  RecordAdImpressionsMutationVariables,
  TossProductsQueryVariables,
} from '@/shared/api/gql/graphql.ts';

type HomePageQuery = {
  homePage: {
    experimentId: string;
    variant: string;
    sections: ServerHomeSection[];
  };
};

const HOME_SECTION_FIELDS = `
  id
  title
  type
  displayOrder
  viewMoreLink
  ... on PaginatedGridSection {
    dataSource { type queryName variables }
  }
  ... on HorizontalScrollSection {
    dataSource { type queryName variables }
  }
  ... on ListSection {
    dataSource { type queryName variables }
  }
  ... on DoubleRowSection {
    dataSource { type queryName variables }
  }
  ... on GridTabbedSection {
    dataSource { type queryName variables }
    tabs { id label variables viewMoreLink }
  }
`;

const QueryHomePage = new TypedDocumentString<
  HomePageQuery,
  Record<string, never>
>(`
  query HomePage {
    homePage {
      experimentId
      variant
      sections {
        ${HOME_SECTION_FIELDS}
        ... on GroupSection {
          sections {
            ${HOME_SECTION_FIELDS}
          }
        }
      }
    }
  }
`);

/**
 * 홈(SDUI) 데이터 접근.
 *
 * 홈 목록은 비로그인도 봐야 하므로 access token 이 없어도 동작해야 한다.
 * ★공개 목록은 withFreshAccessTokenOrNone — 토큰 갱신을 기다리지 않는다(만료면 토큰 없이). 결과가 기기 id 기준이라
 * 로그인 여부로 안 갈린다(guestRecommendedHotDeals 의 선호도 deviceId). 추천 키워드만 내 등록분을 빼야 해서 withAccessToken.
 */
export class HomeService {
  static async getHotDealRankingProducts(
    variables: HotDealRankingProductsQueryVariables,
  ) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryHotDealRankingProducts,
      variables,
    );
    return res.data?.hotDealRankingProducts ?? [];
  }

  static async getGuestRecommendedHotDeals(
    variables: GuestRecommendedHotDealsQueryVariables,
  ) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryGuestRecommendedHotDeals,
      variables,
    );
    return res.data?.guestRecommendedHotDeals ?? [];
  }

  static async getProductsByKeyword(
    variables: HomeProductsByKeywordQueryVariables,
  ) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryProductsByKeyword,
      variables,
    );
    return res.data?.productsByKeyword ?? [];
  }

  static async getProducts(variables: HomeProductsQueryVariables) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryHomeProducts,
      variables,
    );
    return res.data?.products ?? [];
  }

  /** 발견 탭 「핫딜만」. */
  static async getHotDealFeedProducts(
    variables: HotDealFeedProductsQueryVariables,
  ) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryHotDealFeedProducts,
      variables,
    );
    return res.data?.hotDealFeedProducts ?? [];
  }

  static async getExpiringSoonHotDealProducts(
    variables: ExpiringSoonHotDealProductsQueryVariables,
  ) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryExpiringSoonHotDealProducts,
      variables,
    );
    return res.data?.expiringSoonHotDealProducts ?? [];
  }

  static async getCommunityProviders() {
    const res = await HttpClient.withNoAuth().execute(QueryCommunityProviders);
    return res.data?.communityProviders ?? [];
  }

  static async getMallGroups() {
    const res = await HttpClient.withNoAuth().execute(QueryMallGroups);
    return res.data?.mallGroups ?? [];
  }

  static async getHomePage() {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryHomePage,
    );
    return res.data?.homePage ?? null;
  }

  static async getRecommendedKeywords() {
    const res = await HttpClient.withAccessToken().execute(
      QueryRecommendedNotificationKeywords,
    );
    return res.data?.recommendedNotificationKeywords ?? [];
  }

  /** 랭킹 탭 '추천 핫딜' 캐러셀. */
  static async getCommunityRandomRankingProducts(
    variables: CommunityRandomRankingProductsQueryVariables,
  ) {
    const res = await HttpClient.withNoAuth().execute(
      QueryCommunityRandomRankingProducts,
      variables,
    );
    return res.data?.communityRandomRankingProducts ?? [];
  }

  static async getTossCategoryLabels() {
    const res = await HttpClient.withNoAuth().execute(QueryTossCategoryLabels);
    return res.data?.tossCategoryLabels ?? [];
  }

  static async getTossProducts(variables: TossProductsQueryVariables) {
    const res = await HttpClient.withFreshAccessTokenOrNone().execute(
      QueryTossProducts,
      variables,
    );
    return res.data?.productsByKeyword ?? [];
  }

  // ── 광고(자체 슬롯). 애드센스와 다른 시스템이다 ──────────────────────

  static async getActiveAds(variables: ActiveAdsQueryVariables) {
    const res = await HttpClient.withNoAuth().execute(
      QueryActiveAds,
      variables,
    );
    return res.data?.activeAds ?? [];
  }

  static async recordAdImpressions(
    variables: RecordAdImpressionsMutationVariables,
  ) {
    return HttpClient.withAccessToken().execute(
      MutationRecordAdImpressions,
      variables,
    );
  }

  static async recordAdClick(variables: RecordAdClickMutationVariables) {
    return HttpClient.withAccessToken().execute(
      MutationRecordAdClick,
      variables,
    );
  }
}
