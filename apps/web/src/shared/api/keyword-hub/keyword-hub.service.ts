import { execute } from '@/shared/lib/http-client';

import { HotDealType, TypedDocumentString } from '../gql/graphql';

/**
 * 키워드 허브(`/keywords/{slug}`) 등록부·상세. 2026-10-14 웹 코드 화이트리스트에서 서버(crawling-server keyword_hub)로
 * 옮겼다 — 허브·검색 요약 카드(웹·앱)·상세 링크·모델 페이지 링크가 같은 목록을 본다.
 * codegen 이 이 레포에서 깨끗하게 안 돌아 문서·타입을 직접 쓴다(product.service 의 TypedDocumentString 과 같은 방식).
 */
export type KeywordHub = {
  slug: string;
  name: string;
  aliases: string[];
  excludes: string[];
  /** 최근 30일 올라온 딜 수(종료 포함). */
  recentDealCount: number;
  activeDealCount: number;
  /** 수집 상한에 걸려 실제보다 적게 셌다 — "N건+". */
  countCapped: boolean;
  lastDealAt?: string | null;
  /** 최근 30일(KST 달력) 중 딜이 올라온 날 수. */
  activeDays: number;
  /** 많이 올라온 곳 최대 2곳(몫 15%+), share 는 %. */
  topSources: { name: string; share: number }[];
  subscriberCount: number;
};

export type KeywordHubDeal = {
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
  provider?: { nameKr?: string | null } | null;
};

export type KeywordHubModelPage = {
  slug: string;
  brand?: string | null;
  modelName: string;
  dealCount: number;
};

export type KeywordHubDetail = {
  hub: KeywordHub;
  deals: KeywordHubDeal[];
  modelPages: KeywordHubModelPage[];
};

// 비로그인 공개 — cookies() 를 안 읽어 데이터 캐시가 된다. 목록은 배치(6시간) 값이라 10분, 상세는 서버 캐시와 같은 30분.
const LIST_CACHE = { public: true, revalidate: 600 } as const;
const DETAIL_CACHE = { public: true, revalidate: 1800 } as const;

const HUB_FIELDS = `
  slug
  name
  aliases
  excludes
  recentDealCount
  activeDealCount
  countCapped
  lastDealAt
  activeDays
  topSources {
    name
    share
  }
  subscriberCount
`;

const KeywordHubsDocument = new TypedDocumentString<
  { keywordHubs: KeywordHub[] },
  Record<string, never>
>(`
  query KeywordHubs {
    keywordHubs {
      ${HUB_FIELDS}
    }
  }
`);

const KeywordHubDocument = new TypedDocumentString<
  { keywordHub: KeywordHubDetail | null },
  { slug: string }
>(`
  query KeywordHub($slug: String!) {
    keywordHub(slug: $slug) {
      hub {
        ${HUB_FIELDS}
      }
      deals {
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
        mallName
        provider {
          nameKr
        }
      }
      modelPages {
        slug
        brand
        modelName
        dealCount
      }
    }
  }
`);

export class KeywordHubService {
  /** 서버 컴포넌트용(데이터 캐시). */
  static async getHubs(): Promise<KeywordHub[]> {
    return execute(KeywordHubsDocument, undefined, LIST_CACHE).then((res) => res.data.keywordHubs);
  }

  /** 브라우저용(검색 요약 카드·추천 검색어). 공개 쿼리라 로그인 여부와 무관. */
  static async getHubsClient(): Promise<KeywordHub[]> {
    return execute(KeywordHubsDocument).then((res) => res.data.keywordHubs);
  }

  static async getHub(slug: string): Promise<KeywordHubDetail | null> {
    return execute(KeywordHubDocument, { slug }, DETAIL_CACHE).then((res) => res.data.keywordHub);
  }
}
