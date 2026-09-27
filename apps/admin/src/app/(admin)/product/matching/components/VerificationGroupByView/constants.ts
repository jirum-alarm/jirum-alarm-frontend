import { ProductMappingVerificationStatus } from '@/generated/gql/graphql';

export const PAGE_LIMIT = 20;
// brandProductsOrderByMatchCount 서버 상한(@Max(50)). 확장 목록은 이 크기로 최대 10페이지(500개)까지 이어 받는다.
export const EXPANDED_PAGE_LIMIT = 50;
export const EXPANDED_MAX_PAGES = 10;
// 서버(matching-api)는 verificationStatus 가 비면 pending 만 돌려준다 — "검증 완료 포함"은 명시적으로 3종을 보내야 한다.
export const ALL_VERIFICATION_STATUSES = [
  ProductMappingVerificationStatus.PendingVerification,
  ProductMappingVerificationStatus.Verified,
  ProductMappingVerificationStatus.Rejected,
];
