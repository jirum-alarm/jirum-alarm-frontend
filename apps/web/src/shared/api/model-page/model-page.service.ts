import { execute } from '@/shared/lib/http-client';

import { graphql } from '../gql';
import { ModelPageQueryVariables } from '../gql/graphql';

/**
 * 에버그린 모델 페이지(/deals/{slug}) 데이터. 백엔드가 배치 precompute 한 model_page 를
 * 단일 slug 조회로 받음. isPublished=true 만 반환(미퍼블리시는 null → 404).
 * payload(딜 목록·가격요약)는 JSON scalar 라 구조 자유.
 */
export class ModelPageService {
  static async getModelPage(variables: ModelPageQueryVariables) {
    return execute(ModelPageDocument, variables).then((res) => res.data.modelPage);
  }
}

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
