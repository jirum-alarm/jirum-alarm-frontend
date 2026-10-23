import { HotDealType, TypedDocumentString } from '@/shared/api/gql/graphql';
import { execute } from '@/shared/lib/http-client';

import type { KeywordFrequency } from '@jirum/domain/keyword-frequency';

/** 카드의 최근 딜 한 장 — 목록 카드(ProductCardType)가 읽는 필드 그대로. */
export type KeywordBoardDeal = {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  postedAt: string;
  categoryId?: number | null;
  isEnd?: boolean | null;
  isHot?: boolean | null;
  hotDealType?: HotDealType | null;
  mallName?: string | null;
  isYearLowest?: boolean | null;
  priceSaving?: { basis: string; percent: number } | null;
  provider?: { nameKr?: string | null } | null;
};

export type KeywordBoardItem = KeywordFrequency & {
  weekDealCount: number;
  recentDeals: KeywordBoardDeal[];
};

/**
 * 키워드 탭 «내 키워드 상황판»(crawling-server keywordDealFrequencies + recentDeals·weekDealCount 필드, 2026-10-23).
 * 횟수만 쓰는 keyword-frequency.service 와 같은 쿼리지만 상품까지 받아 문서를 따로 둔다 — 입력칸 미리보기까지 상품을 받지 않게.
 * 수기 TypedDocumentString — keyword-frequency.service.ts 와 같은 이유.
 */
const QueryKeywordBoardDocument = new TypedDocumentString<
  { keywordDealFrequencies: KeywordBoardItem[] },
  { keywords: string[]; limit: number }
>(`
  query QueryKeywordBoard($keywords: [String!]!, $limit: Int!) {
    keywordDealFrequencies(keywords: $keywords) {
      keyword
      dealCount
      windowDays
      lastDealAt
      suggestedKeyword
      suggestedDealCount
      weekDealCount
      recentDeals(limit: $limit) {
        id
        title
        price
        thumbnail
        postedAt
        categoryId
        isEnd
        isHot
        hotDealType
        mallName
        isYearLowest
        priceSaving {
          basis
          percent
        }
        provider {
          nameKr
        }
      }
    }
  }
`);

export class KeywordBoardService {
  static async board(keywords: string[], limit: number) {
    return execute(QueryKeywordBoardDocument, { keywords, limit }).then(
      (res) => res.data.keywordDealFrequencies,
    );
  }
}
