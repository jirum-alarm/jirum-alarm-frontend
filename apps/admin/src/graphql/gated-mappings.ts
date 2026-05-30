import { gql } from '@apollo/client';

/**
 * 게이트가 차단한 매핑 목록 (추출 오염 / 묶음글 등, not_matchable).
 * target IS NULL 이라 기존 pendingVerifications 화면엔 안 잡히는 사각지대를 전용 조회.
 *
 * 운영자는 title 과 (extractedProductInfo·matchingReasoning 의) 추출 brand/model 을 나란히
 * 보고 "진짜 오염(거절 유지)" vs "게이트 오판(승인→재매칭 대상)" 을 판단한다.
 */
export const QueryGatedMappings = gql`
  query QueryGatedMappings(
    $limit: Int!
    $searchAfter: [String!]
    $matchingSource: [String!]
    $productTitle: String
    $orderBy: OrderOptionType
  ) {
    gatedMappings(
      limit: $limit
      searchAfter: $searchAfter
      matchingSource: $matchingSource
      productTitle: $productTitle
      orderBy: $orderBy
    ) {
      id
      productId
      product {
        title
        thumbnail
        price
        url
        provider {
          name
        }
      }
      matchStatus
      matchingSource
      matchingReasoning
      extractedProductInfo
      createdAt
      searchAfter
    }
  }
`;
