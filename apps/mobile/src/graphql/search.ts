import {graphql} from '../shared/api/gql';

/**
 * 검색 결과 목록. web: shared/api/product/product.service.ts 의 `QueryProducts`.
 *
 * ★홈의 `HomeProducts` 와 인자·필드가 거의 같지만 따로 둔다 — 검색만
 * `estimatedTotal`("약 N건")을 읽고, 홈 쿼리에 필드를 더하면 홈 5개 섹션의
 * 응답이 같이 커진다(홈은 이 값을 안 쓴다).
 *
 * ⚠️`keyword` 가 있으면 `orderBy` 5종이 무시된다(2026-08-10 실측 —
 * Meili 검색 경로가 sort 를 덮는다). 구별되는 3종만 web 이 실제로 보낸다:
 * 기본(orderBy 없음=최신)·RELEVANCE·COMMENT_COUNT. 그래서 정렬 UI 도 그 셋뿐이다.
 */
export const QuerySearchProducts = graphql(`
  query SearchProducts(
    $limit: Int!
    $searchAfter: [String!]
    $startDate: DateTime
    $orderBy: ProductOrderType
    $categoryIds: [Int!]
    $keyword: String
    $isEnd: Boolean
    $providerIds: [Int!]
  ) {
    products(
      limit: $limit
      searchAfter: $searchAfter
      startDate: $startDate
      orderBy: $orderBy
      categoryIds: $categoryIds
      keyword: $keyword
      isEnd: $isEnd
      providerIds: $providerIds
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
      estimatedTotal
      postedAt
    }
  }
`);

/** 자동완성 제안어. web: shared/api/search/search.service.ts */
export const QuerySearchSuggestions = graphql(`
  query SearchSuggestions($prefix: String!, $limit: Int) {
    searchSuggestions(prefix: $prefix, limit: $limit)
  }
`);
