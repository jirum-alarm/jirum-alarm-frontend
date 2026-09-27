import { gql } from '@apollo/client';

/**
 * 게이트가 차단한 매핑 목록 (추출 오염 / 묶음글 등, not_matchable).
 * target IS NULL 이라 기존 pendingVerifications 화면엔 안 잡히는 사각지대를 전용 조회.
 *
 * 운영자는 title 과 (extractedProductInfo·matchingReasoning 의) 추출 brand/model 을 나란히
 * 보고 "진짜 오염(거절 유지)" vs "게이트 오판(승인)" 을 판단한다.
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
      verificationStatus
      matchingSource
      matchingReasoning
      extractedProductInfo
      createdAt
      searchAfter
    }
  }
`;

/** 게이트 오판 → 게이트 행 삭제 후 게이트만 끄고 1회 재매칭(결과는 pending 검수 큐로). status: requeued | already_mapped | unavailable */
export const MutationRematchGatedMapping = gql`
  mutation MutationRematchGatedMapping($productMappingId: Int!) {
    rematchGatedMapping(productMappingId: $productMappingId) {
      status
      productId
    }
  }
`;
