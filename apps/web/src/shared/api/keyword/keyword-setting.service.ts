import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

/**
 * 수기 TypedDocumentString — codegen 생성 타입이 아니다.
 *
 * codegen 은 스키마를 dev 엔드포인트에서 당겨오는데 dev 환경이 사라져 응답하지 않고,
 * 운영 스키마로 돌리면 이번 변경과 무관한 기존 문서(`graphql/product.ts` 의
 * `categoryId` ↔ 운영 `categoryIds`)에서 validation 이 깨져 전체 생성이 중단된다.
 * notification.service.ts 와 같은 escape hatch. dev 복구 후 codegen 으로 옮기면 된다.
 */
type UpdatePriceDropOnlyResult = { updateNotificationKeywordPriceDropOnly: boolean };
type UpdatePriceDropOnlyVariables = { id: number; priceDropOnly: boolean };

const MutationUpdateKeywordPriceDropOnlyDocument = new TypedDocumentString<
  UpdatePriceDropOnlyResult,
  UpdatePriceDropOnlyVariables
>(`
  mutation MutationUpdateNotificationKeywordPriceDropOnly($id: Int!, $priceDropOnly: Boolean!) {
    updateNotificationKeywordPriceDropOnly(id: $id, priceDropOnly: $priceDropOnly)
  }
`);

type UpdatePriceRangeVariables = { id: number; minPrice: number | null; maxPrice: number | null };

const MutationUpdateKeywordPriceRangeDocument = new TypedDocumentString<
  { updateNotificationKeywordPriceRange: boolean },
  UpdatePriceRangeVariables
>(`
  mutation MutationUpdateNotificationKeywordPriceRange($id: Int!, $minPrice: Int, $maxPrice: Int) {
    updateNotificationKeywordPriceRange(id: $id, minPrice: $minPrice, maxPrice: $maxPrice)
  }
`);

type UpdateExcludeKeywordsVariables = { id: number; excludeKeywords: string[] };

const MutationUpdateKeywordExcludeKeywordsDocument = new TypedDocumentString<
  { updateNotificationKeywordExcludeKeywords: boolean },
  UpdateExcludeKeywordsVariables
>(`
  mutation MutationUpdateNotificationKeywordExcludeKeywords($id: Int!, $excludeKeywords: [String!]!) {
    updateNotificationKeywordExcludeKeywords(id: $id, excludeKeywords: $excludeKeywords)
  }
`);

export class KeywordSettingService {
  static async updatePriceDropOnly(variables: UpdatePriceDropOnlyVariables) {
    return execute(MutationUpdateKeywordPriceDropOnlyDocument, variables).then((res) => res.data);
  }

  static async updatePriceRange(variables: UpdatePriceRangeVariables) {
    return execute(MutationUpdateKeywordPriceRangeDocument, variables).then((res) => res.data);
  }

  static async updateExcludeKeywords(variables: UpdateExcludeKeywordsVariables) {
    return execute(MutationUpdateKeywordExcludeKeywordsDocument, variables).then((res) => res.data);
  }
}
