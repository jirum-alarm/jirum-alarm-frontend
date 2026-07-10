import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import { ModelPageQueryVariables } from '../gql/graphql';

/**
 * 에버그린 모델 페이지(/deals/{slug}) 데이터. 백엔드가 배치 precompute 한 model_page 를
 * 단일 slug 조회로 받음. isPublished=true 만 반환(미퍼블리시는 null → 404).
 * payload(딜 목록·가격요약)는 JSON scalar 라 구조 자유.
 */
// 비로그인 공개 SEO 페이지 — cookies() 안 읽어 ISR 가능 + 10분 data cache.
const PUBLIC_ISR = { public: true, revalidate: 600 } as const;

export class ModelPageService {
  static async getModelPage(variables: ModelPageQueryVariables) {
    return execute(ModelPageDocument, variables, PUBLIC_ISR).then((res) => res.data.modelPage);
  }

  /** /deals 인덱스 — 퍼블리시된 모델 페이지 목록(딜 많은 순). 카드 필드만. */
  static async getPublishedModelPages() {
    return execute(PublishedModelPagesDocument, undefined, PUBLIC_ISR).then(
      (res) => res.data.publishedModelPages,
    );
  }
}

const PublishedModelPagesDocument = graphql(`
  query publishedModelPages {
    publishedModelPages {
      slug
      brand
      modelName
      dealCount
      heroImage
      heroMinPrice
      unitLabel
      unitPrice
      categoryId
      categoryName
    }
  }
`);

const ModelPageDocument = graphql(`
  query modelPage($slug: String!) {
    modelPage(slug: $slug) {
      slug
      brand
      modelName
      dealCount
      lastDealAt
      metaDescription
      payload
    }
  }
`);
