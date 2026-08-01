// ⚠️ DEPRECATED — 이 파일의 문서들은 **아무도 import 하지 않는다**(레거시 Apollo gql).
// 실제 사용 문서는 `shared/api/auth/auth.service.ts`. 필드를 추가할 땐 그쪽을 고칠 것
// (2026-08-01: 여기만 고쳐서 배포했다가 토글이 안 듣는 사고).
import { gql } from '@apollo/client';

export const MutationAddNotificationKeyword = gql`
  mutation MutationAddNotificationKeyword($keyword: String!, $fromRecommendation: Boolean) {
    addNotificationKeyword(keyword: $keyword, fromRecommendation: $fromRecommendation)
  }
`;

export const MutationRemoveNotificationKeyword = gql`
  mutation MutationRemoveNotificationKeyword($id: Float!) {
    removeNotificationKeyword(id: $id)
  }
`;

export const QueryMypageKeyword = gql`
  query QueryMypageKeyword($limit: Int!, $searchAfter: [String!]) {
    notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
      id
      keyword
      priceDropOnly
    }
  }
`;
// export const QueryNotificationKeywordsByMe = gql`
//   query QueryNotificationKeywordsByMe($limit: Int!, $searchAfter: [String!]) {
//     notificationKeywordsByMe(limit: $limit, searchAfter: $searchAfter) {
//       id
//       userId
//       keyword
//       isActive
//       createdAt
//     }
//   }
// `;
