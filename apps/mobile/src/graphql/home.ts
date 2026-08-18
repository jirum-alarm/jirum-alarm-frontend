import {graphql} from '../shared/api/gql';

/**
 * 홈(SDUI) 섹션이 쓰는 쿼리들.
 *
 * 필드는 web 을 정본으로 1:1 대조해서 맞췄다:
 *   apps/web/src/shared/api/product/product.service.ts
 *   apps/web/src/graphql/product.ts (guestRecommendedHotDeals)
 *   apps/web/src/shared/api/promotion/promotion.service.ts
 *
 * 같은 상품이 웹(다른 탭 웹뷰)과 앱(네이티브 홈)에서 다르게 보이면 유저는 버그로
 * 읽는다. 임의로 필드를 덜어내지 않는다.
 *
 * ★ 쿼리마다 필드 집합이 미묘하게 다르다(web 실측):
 *   - mallName            → products / expiringSoonHotDealProducts 만
 *   - earliestExpiryDate  → expiringSoonHotDealProducts 만
 *   - provider { nameKr } → 5개 전부 (제보 커뮤니티, 100% 채워짐)
 * 카드가 없는 필드를 그리려 하면 반쯤 빈 UI 가 된다.
 */

/** 놓치면 아까운 핫딜 (PAGINATED_GRID) */
export const QueryHotDealRankingProducts = graphql(`
  query HotDealRankingProducts($page: Int!, $limit: Int!) {
    hotDealRankingProducts(page: $page, limit: $limit) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

/** 내 취향 저격 핫딜 (PAGINATED_GRID). 0건이면 섹션 자체를 숨긴다. */
export const QueryGuestRecommendedHotDeals = graphql(`
  query GuestRecommendedHotDeals($page: Int!, $limit: Int!) {
    guestRecommendedHotDeals(page: $page, limit: $limit) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

/** 만원 이하 템(HORIZONTAL_SCROLL) · 프리미엄(LIST) · 탭 폴백 */
export const QueryProductsByKeyword = graphql(`
  query HomeProductsByKeyword(
    $limit: Int!
    $searchAfter: [String!]
    $keyword: String!
    $orderBy: KeywordProductOrderType!
    $orderOption: OrderOptionType!
  ) {
    productsByKeyword(
      limit: $limit
      searchAfter: $searchAfter
      keyword: $keyword
      orderBy: $orderBy
      orderOption: $orderOption
    ) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

/**
 * 몰별·커뮤니티별 탭(GRID_TABBED) + 랭킹 슬라이더.
 * mallName 이 있는 두 쿼리 중 하나.
 *
 * ★ web 은 `categoryId`/`providerId` 단수 인자를 넘기지만 **스키마엔 복수형만 있다.**
 * 운영 API 가 미선언 인자를 조용히 받아줘서 web 은 동작하지만(실측 확인),
 * codegen 은 커밋된 스키마로 검증하므로 여기선 복수형을 쓴다.
 * 호출부에서 `providerId` → `providerIds:[id]` 로 변환한다
 * (`entities/home/promotion-sections.ts`).
 */
export const QueryHomeProducts = graphql(`
  query HomeProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $orderOption: OrderOptionType
    $categoryIds: [Int!]
    $keyword: String
    $thumbnailType: ThumbnailType
    $isEnd: Boolean
    $isHot: Boolean
    $providerIds: [Int!]
    $mallGroupId: Int
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      orderOption: $orderOption
      categoryIds: $categoryIds
      keyword: $keyword
      thumbnailType: $thumbnailType
      isEnd: $isEnd
      isHot: $isHot
      providerIds: $providerIds
      mallGroupId: $mallGroupId
    ) {
      id
      title
      mallId
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      mallName
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
    }
  }
`);

/** 유통기한 임박 특가 (DOUBLE_ROW). earliestExpiryDate 를 쓰는 유일한 쿼리. */
export const QueryExpiringSoonHotDealProducts = graphql(`
  query ExpiringSoonHotDealProducts(
    $daysUntilExpiry: Int!
    $limit: Int!
    $searchAfter: [String!]
  ) {
    expiringSoonHotDealProducts(
      daysUntilExpiry: $daysUntilExpiry
      limit: $limit
      searchAfter: $searchAfter
    ) {
      id
      title
      mallId
      mallName
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      searchAfter
      postedAt
      earliestExpiryDate
    }
  }
`);

/** GRID_TABBED 의 탭 목록을 만든다(커뮤니티 제보처). */
export const QueryCommunityProviders = graphql(`
  query CommunityProviders {
    communityProviders {
      id
      name
      nameKr
    }
  }
`);

/** GRID_TABBED 의 탭 목록을 만든다(몰 그룹). isActive 필터 + sort 정렬은 클라에서. */
export const QueryMallGroups = graphql(`
  query MallGroups {
    mallGroups {
      id
      title
      isActive
      sort
    }
  }
`);

/** 인기 키워드 추천 칩 (RecommendedKeywordSection) */
export const QueryRecommendedNotificationKeywords = graphql(`
  query RecommendedNotificationKeywords {
    recommendedNotificationKeywords
  }
`);

/** 토스 특가 섹션의 하위 탭 목록 */
export const QueryTossCategoryLabels = graphql(`
  query TossCategoryLabels {
    tossCategoryLabels
  }
`);

/**
 * 토스 특가 목록.
 * web 은 productsByKeyword 에 tossCategoryLabel 을 얹어서 쓴다(별도 필드가 아니다).
 * data(JSONObject) 가 토스 확장정보의 원천이라 반드시 포함한다.
 */
export const QueryTossProducts = graphql(`
  query TossProducts(
    $limit: Int!
    $searchAfter: [String!]
    $keyword: String!
    $orderBy: KeywordProductOrderType!
    $orderOption: OrderOptionType!
    $tossCategoryLabel: String
  ) {
    productsByKeyword(
      limit: $limit
      searchAfter: $searchAfter
      keyword: $keyword
      orderBy: $orderBy
      orderOption: $orderOption
      tossCategoryLabel: $tossCategoryLabel
    ) {
      id
      title
      price
      thumbnail
      data
      searchAfter
      postedAt
    }
  }
`);

/**
 * 랭킹 탭의 '추천 핫딜' 캐러셀. web useTrendingViewModel 의
 * hotdealProductsRandom 과 같은 쿼리다(count 중에서 limit 개를 무작위로).
 */
export const QueryCommunityRandomRankingProducts = graphql(`
  query CommunityRandomRankingProducts($count: Int!, $limit: Int!) {
    communityRandomRankingProducts(count: $count, limit: $limit) {
      id
      title
      mallId
      mallName
      url
      isHot
      isEnd
      price
      providerId
      categoryId
      category
      thumbnail
      hotDealType
      provider {
        nameKr
      }
      postedAt
    }
  }
`);
