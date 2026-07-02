import { gql } from '@apollo/client';

// 어드민 발행 검수용 — 자동 발굴 배치가 만든 초안(isPublished=false)을 보고 토글.
// onlyDrafts=true 면 초안만, false 면 전체(딜 많은 순).
export const QueryModelPagesByAdmin = gql`
  query QueryModelPagesByAdmin($onlyDrafts: Boolean) {
    modelPagesByAdmin(onlyDrafts: $onlyDrafts) {
      id
      slug
      brand
      modelName
      dealCount
      lastDealAt
      heroImage
      heroMinPrice
      isPublished
    }
  }
`;

// 미리보기 — 발행 여부 무관 slug 조회(초안 검수용). payload 전체 반환.
export const QueryModelPagePreviewByAdmin = gql`
  query QueryModelPagePreviewByAdmin($slug: String!) {
    modelPagePreviewByAdmin(slug: $slug) {
      id
      isPublished
      slug
      brand
      modelName
      dealCount
      lastDealAt
      metaDescription
      payload
    }
  }
`;

// 발행 토글 — isPublished 만 바꾼다(킬스위치). 성공 시 true.
export const MutationSetModelPagePublishedByAdmin = gql`
  mutation MutationSetModelPagePublishedByAdmin($id: Int!, $isPublished: Boolean!) {
    setModelPagePublishedByAdmin(id: $id, isPublished: $isPublished)
  }
`;
