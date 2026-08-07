import type { Deal, PriceConfidence, PricePoint } from './types';

/** 백엔드 `ProductPriceHistory` 중 우리가 쓰는 부분만. */
export type PriceHistory = {
  basis: 'MAPPING' | 'CLUSTER' | 'SIMILAR';
  confidence: PriceConfidence;
  currency: string;
  pointCount: number;
  points: { date: string; price: number; deal: { id: number; isSeed: boolean } }[];
};

/** GraphQL 응답 → 판정용 평면 점. deal 중첩을 여기서 벗긴다. */
export const toPricePoints = (h: PriceHistory): PricePoint[] =>
  h.points.map((p) => ({
    date: p.date,
    price: p.price,
    dealId: p.deal.id,
    isSeed: p.deal.isSeed,
  }));

/**
 * GraphQL 엔드포인트.
 *
 * - prod(ai.jirum-alarm.com): 운영 공개 API (기본값)
 * - dev(dev-ai.jirum-alarm.com): 클러스터 내부 crawling-server-dev
 *   → Dockerfile ARG/ENV `GRAPHQL_ENDPOINT` 로 주입한다.
 *
 * 서버에서만 읽는다(라우트 핸들러). 클라이언트로 새지 않게 NEXT_PUBLIC_ 접두어를 쓰지 않는다.
 */
// ⚠️ `??` 가 아니라 truthy 검사여야 한다 — Docker ARG 에 기본값이 없으면 ENV 가 빈 문자열로
// 구워지고 `??` 는 그걸 통과시켜 ERR_INVALID_URL 이 난다(운영 실측 2026-08-07).
const ENDPOINT = process.env.GRAPHQL_ENDPOINT || 'https://jirum-alarm.com/api/graphql';

/** products.limit 은 50 초과하면 400. orderBy 는 enum 이라 따옴표 금지. */
const MAX_LIMIT = 50;

/**
 * 가격 추이 조회 창. 90일이 백엔드 기본값이다.
 *
 * ⚠️ `priceHistory` 는 **ResolveField** 라 상품마다 따로 계산된다(Meili 유사검색 포함).
 * 50건에 다 붙이면 1건이 50배가 된다 — 그래서 목록 쿼리에는 넣지 않고,
 * 게이트를 통과한 대표 딜 1건에만 따로 물어본다(fetchPriceHistory).
 */
const HISTORY_DAYS = 90;

// ⚠️ limit 은 Int! (non-null). Int 로 선언하면 GRAPHQL_VALIDATION_FAILED 400.
const QUERY = `
  query AiSearchDeals($keyword: String, $limit: Int!) {
    products(keyword: $keyword, limit: $limit, orderBy: POSTED_AT) {
      id
      title
      url
      parsedPrice
      priceCurrency
      mallName
      categoryName
      postedAt
      commentSummary {
        summary
        satisfaction
        price
        option
        purchaseMethod
      }
    }
  }
`;

/**
 * 한 상품의 가격 추이.
 *
 * ⚠️ 필드 이름 함정(실측): 점은 `lowest` 가 아니라 **`price`** 고,
 * 루트에 `stats` 는 **없다**(GRAPHQL_VALIDATION_FAILED). 사분위는 우리가 계산한다.
 */
const HISTORY_QUERY = `
  query AiPriceHistory($id: Int!, $days: Int) {
    product(id: $id) {
      id
      priceHistory(days: $days) {
        basis
        confidence
        currency
        pointCount
        points {
          date
          price
          deal { id isSeed }
        }
      }
    }
  }
`;

/** 공통 GraphQL 호출. signal 을 받아 클라 이탈 시 업스트림도 끊는다. */
const gql = async <T>(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<T> => {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal,
  });

  if (!res.ok) throw new Error(`GraphQL ${res.status}`);

  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error('GraphQL: empty data');

  return json.data;
};

export const fetchDeals = async (keyword: string, signal?: AbortSignal): Promise<Deal[]> => {
  const data = await gql<{ products?: Deal[] }>(QUERY, { keyword, limit: MAX_LIMIT }, signal);
  return data.products ?? [];
};

/**
 * 대표 딜 1건의 가격 추이. 실패는 **예외로 던지지 않는다** —
 * 위치 판정은 부가 정보라, 못 가져왔으면 그 카드만 빠지고 나머지 답변은 그대로 나가야 한다.
 */
export const fetchPriceHistory = async (
  productId: number | string,
  signal?: AbortSignal,
): Promise<PriceHistory | null> => {
  /*
   * ⚠️ `products.id` 는 GraphQL 에서 **String 으로 직렬화**되는데(`ID` 스칼라)
   * `product(id:)` 는 `Int!` 다. 문자열을 그대로 넘기면
   * `Int cannot represent non-integer value: "27180311"` 로 BAD_USER_INPUT 400 이 난다
   * (실측 2026-08-08 — 타입에는 number 라 적혀 있어 tsc 가 못 잡는다).
   */
  const id = Number(productId);
  if (!Number.isInteger(id)) return null;

  try {
    const data = await gql<{ product?: { priceHistory?: PriceHistory | null } | null }>(
      HISTORY_QUERY,
      { id, days: HISTORY_DAYS },
      signal,
    );
    return data.product?.priceHistory ?? null;
  } catch (e) {
    if (signal?.aborted) throw e;
    console.error('[ai] priceHistory failed:', e);
    return null;
  }
};
