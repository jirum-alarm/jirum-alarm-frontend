import type { Deal } from './types';

/**
 * GraphQL 엔드포인트.
 *
 * - prod(ai.jirum-alarm.com): 운영 공개 API (기본값)
 * - dev(dev-ai.jirum-alarm.com): 클러스터 내부 crawling-server-dev
 *   → Dockerfile ARG/ENV `GRAPHQL_ENDPOINT` 로 주입한다.
 *
 * 서버에서만 읽는다(라우트 핸들러). 클라이언트로 새지 않게 NEXT_PUBLIC_ 접두어를 쓰지 않는다.
 */
const ENDPOINT = process.env.GRAPHQL_ENDPOINT ?? 'https://jirum-alarm.com/api/graphql';

/** products.limit 은 50 초과하면 400. orderBy 는 enum 이라 따옴표 금지. */
const MAX_LIMIT = 50;

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

export const fetchDeals = async (keyword: string): Promise<Deal[]> => {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: QUERY, variables: { keyword, limit: MAX_LIMIT } }),
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`GraphQL ${res.status}`);

  const json = (await res.json()) as {
    data?: { products?: Deal[] };
    errors?: { message: string }[];
  };
  if (json.errors?.length) throw new Error(json.errors[0].message);

  return json.data?.products ?? [];
};
