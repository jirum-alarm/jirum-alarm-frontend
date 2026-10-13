import { BEAUTY_CATEGORY_ID } from '@/shared/config/beauty';
import { graphqlEndpoint } from '@/shared/config/env';

import {
  type BeautyProduct,
  latestVariables,
  type ProductListVariables,
  QUERY_PRODUCTS,
  QUERY_TOSS_PRODUCTS,
  rankingVariables,
  tossBeautyVariables,
  type TossDeal,
  type TossProductRow,
  toTossDeal,
} from './products';

/** 서버 데이터 캐시 수명 — web /beauty·/toss·/deals 의 ISR 10분과 같다. */
const REVALIDATE_SECONDS = 600;

/**
 * 서버 렌더용 GraphQL(공개 쿼리만). 쿠키·토큰을 싣지 않아 요청마다 같은 본문 → Next 데이터 캐시가 맞는다.
 * (web http-client 의 public:true + revalidate 와 같은 모양)
 */
async function serverQuery<T>(query: string, variables: object): Promise<T> {
  const res = await fetch(graphqlEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error('GraphQL: empty data');
  return json.data;
}

const getProducts = async (variables: ProductListVariables) =>
  (await serverQuery<{ products: BeautyProduct[] }>(QUERY_PRODUCTS, variables)).products ?? [];

/** 섹션 하나가 실패해도 페이지는 그린다 — 빈 목록으로 두고 그 섹션만 비운다. */
const orEmpty = <T>(promise: Promise<T[]>): Promise<T[]> => promise.catch(() => []);

export const fetchBeautyRanking = (limit: number) =>
  orEmpty(getProducts(rankingVariables(BEAUTY_CATEGORY_ID, limit)));

/** 무한 스크롤의 첫 쪽 — 브라우저가 같은 variables 로 이어 받으므로 호출자가 만든 것을 그대로 쓴다. */
export const fetchProductList = (variables: ProductListVariables) =>
  orEmpty(getProducts(variables));

export const fetchBeautyLatest = (limit: number) =>
  orEmpty(getProducts(latestVariables(BEAUTY_CATEGORY_ID, limit)));

export const fetchTossBeauty = (limit: number): Promise<TossDeal[]> =>
  orEmpty(
    serverQuery<{ productsByKeyword: TossProductRow[] }>(
      QUERY_TOSS_PRODUCTS,
      tossBeautyVariables(limit),
    ).then((data) => (data.productsByKeyword ?? []).map(toTossDeal)),
  );
