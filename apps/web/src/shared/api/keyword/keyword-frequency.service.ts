import { TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

import type { KeywordFrequency } from '@jirum/domain/keyword-frequency';

/**
 * 키워드 미리보기(crawling-server `keywordDealFrequencies`, 공개) — 지난 90일 횟수·마지막 딜·드물면 넓힐 첫 낱말.
 * 수기 TypedDocumentString — keyword-setting.service.ts 와 같은 이유(운영 스키마 codegen 이 무관한 옛 문서에서 깨진다).
 */
const QueryKeywordDealFrequenciesDocument = new TypedDocumentString<
  { keywordDealFrequencies: KeywordFrequency[] },
  { keywords: string[] }
>(`
  query QueryKeywordDealFrequencies($keywords: [String!]!) {
    keywordDealFrequencies(keywords: $keywords) {
      keyword
      dealCount
      windowDays
      lastDealAt
      suggestedKeyword
      suggestedDealCount
    }
  }
`);

export class KeywordFrequencyService {
  static async frequencies(keywords: string[]) {
    return execute(QueryKeywordDealFrequenciesDocument, { keywords }).then(
      (res) => res.data.keywordDealFrequencies,
    );
  }
}
