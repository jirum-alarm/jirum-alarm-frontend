import { execute } from '@/shared/lib/http-client';

import { HotDealType, TypedDocumentString } from '../gql/graphql';

/**
 * 해외직구 시즌 허브(/season/2026-black-friday) 데이터. 비로그인 공개 쿼리만 — cookies() 를 안 읽어 데이터 캐시가 된다.
 * codegen 이 이 레포에서 깨끗하게 안 돌아 문서·타입을 직접 쓴다(keyword-hub.service 와 같은 방식).
 *
 * 딜 목록: 시즌 섹션(서버 product/overseas-sale.logic — 기본 11/11~12/10, env 로 날짜가 바뀐다)이 열려 있으면 「해외직구세일」,
 * 닫혀 있으면 서버가 빈 배열을 주므로 최근 알리 딜(「알리」)로 채운다. 날짜를 웹에 다시 적지 않으려고 «비었나»로 가른다.
 */
export type SeasonDeal = {
  id: string;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  postedAt: string;
  categoryId?: number | null;
  isEnd?: boolean | null;
  isHot?: boolean | null;
  hotDealType?: HotDealType | null;
  isYearLowest?: boolean | null;
  provider?: { nameKr?: string | null } | null;
};

// 섹션 후보는 서버가 1분 캐시, 알리 딜은 수시로 올라온다 — 10분이면 허브로선 충분히 싱싱하다.
const CACHE = { public: true, revalidate: 600 } as const;

const SeasonDealsDocument = new TypedDocumentString<
  { productsByKeyword: SeasonDeal[] },
  { keyword: string; limit: number }
>(`
  query SeasonDeals($keyword: String!, $limit: Int!) {
    productsByKeyword(keyword: $keyword, limit: $limit, orderBy: POSTED_AT, orderOption: DESC) {
      id
      title
      price
      thumbnail
      postedAt
      categoryId
      isEnd
      isHot
      hotDealType
      isYearLowest
      provider {
        nameKr
      }
    }
  }
`);

const SeasonAliexpressLinkDocument = new TypedDocumentString<
  { seasonAliexpressLink: string | null },
  Record<string, never>
>(`
  query SeasonAliexpressLink {
    seasonAliexpressLink
  }
`);

export const SEASON_SALE_KEYWORD = '해외직구세일';
export const SEASON_FALLBACK_KEYWORD = '알리';

export class SeasonService {
  static async getDeals(keyword: string, limit: number): Promise<SeasonDeal[]> {
    return execute(SeasonDealsDocument, { keyword, limit }, CACHE).then(
      (res) => res.data.productsByKeyword,
    );
  }

  /** 알리 행사장 제휴 링크(콜백 dp=season_hub:). 발급 실패면 null. */
  static async getAliexpressLink(): Promise<string | null> {
    return execute(SeasonAliexpressLinkDocument, undefined, CACHE).then(
      (res) => res.data.seasonAliexpressLink,
    );
  }
}
