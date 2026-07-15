import { graphql } from '@/shared/api/gql';

// 토스 카테고리 인기 하위 탭 목록(실제 존재하는 categoryLabel, 동적).
export const QueryTossCategoryLabels = graphql(`
  query QueryTossCategoryLabels {
    tossCategoryLabels
  }
`);

// 토스 목록 조회 (data=toss 확장정보 포함). codegen 스캔 경로(src/graphql/*)에 둬야 타입 생성됨.
export const QueryTossProducts = graphql(`
  query QueryTossProducts(
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
