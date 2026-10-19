import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

export type GoodPriceUnit = 'LITER' | 'HUNDRED_GRAM' | 'COUNT' | 'FACE_VALUE' | 'TOTAL';

/**
 * 알림함 「좋은 가격만 받기」(crawling src/wait — 「언제 사나」 엔진). 수기 TypedDocumentString — keyword-setting.service.ts 와
 * 같은 이유(운영 스키마 codegen 이 무관한 옛 문서에서 깨진다).
 */
export type GoodPriceSuggestion = {
  keyword: string;
  priced: boolean;
  watching: boolean;
  unit: GoodPriceUnit;
  goodPrice: number | null;
  goodDealCount: number;
  rawMatchCount: number;
  windowDays: number;
};

const QueryGoodPriceSuggestionDocument = new TypedDocumentString<
  { goodPriceSuggestion: GoodPriceSuggestion | null },
  { keyword: string }
>(`
  query QueryGoodPriceSuggestion($keyword: String!) {
    goodPriceSuggestion(keyword: $keyword) {
      keyword
      priced
      watching
      unit
      goodPrice
      goodDealCount
      rawMatchCount
      windowDays
    }
  }
`);

const MutationApplyGoodPriceOnlyDocument = new TypedDocumentString<
  { applyGoodPriceOnly: { keyword: string; priced: boolean } },
  { keyword: string }
>(`
  mutation MutationApplyGoodPriceOnly($keyword: String!) {
    applyGoodPriceOnly(keyword: $keyword) {
      keyword
      priced
    }
  }
`);

export class GoodPriceService {
  static async suggestion(keyword: string) {
    return execute(QueryGoodPriceSuggestionDocument, { keyword }).then(
      (res) => res.data.goodPriceSuggestion,
    );
  }

  static async apply(keyword: string) {
    return execute(MutationApplyGoodPriceOnlyDocument, { keyword }).then((res) => res.data);
  }
}
