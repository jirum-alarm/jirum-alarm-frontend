'use client';

import { readDeviceId } from '@/shared/lib/device-id';
import { canWrite } from '@/shared/lib/service-host';

import { type BeautyProduct, type ProductListVariables, QUERY_PRODUCTS } from './products';

/**
 * 브라우저는 basePath 밖의 루트 `/api/graphql` 로 부른다 = 같은 도메인의 본 서비스(web) 프록시.
 * 로그인 쿠키·토큰 갱신·기기 헤더 처리를 web 이 이미 하므로 이 앱에 프록시를 따로 두지 않는다.
 * (로컬 단독 실행은 next.config.ts rewrites 가 운영으로 넘긴다 — 읽기만, 쓰기는 아래 canWrite 로 막는다.)
 */
const GRAPHQL_PROXY = '/api/graphql';

async function post<T>(query: string, variables: object, keepalive = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/graphql-response+json',
  };
  const deviceId = readDeviceId();
  if (deviceId) headers['X-Device-Id'] = deviceId;

  const res = await fetch(GRAPHQL_PROXY, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
    credentials: 'include',
    cache: 'no-store',
    keepalive,
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json = (await res.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) throw new Error(json.errors[0].message);
  if (!json.data) throw new Error('GraphQL: empty data');
  return json.data;
}

export const fetchProductPage = async (variables: ProductListVariables) =>
  (await post<{ products: BeautyProduct[] }>(QUERY_PRODUCTS, variables)).products ?? [];

const MUTATION_RECORD_IMPRESSIONS = `
  mutation BeautyRecordProductImpressions($source: String!, $impressions: [ProductImpressionInput!]!) {
    recordProductImpressions(source: $source, impressions: $impressions)
  }
`;

const MUTATION_ADD_USER_DEVICE = `
  mutation BeautyAddUserDevice($deviceId: String!) {
    addUserDevice(deviceId: $deviceId)
  }
`;

/** 노출 기록(fire-and-forget). 지름알림 도메인 밖(로컬)에선 보내지 않는다. */
export function recordProductImpressions(
  source: string,
  impressions: { productId: number; position: number }[],
) {
  if (!canWrite() || impressions.length === 0) return;
  void post(MUTATION_RECORD_IMPRESSIONS, { source, impressions }, true).catch(() => {});
}

/** 첫 방문 기기 등록 — web DeviceId 와 같은 동작(먼저 /beauty 로 들어온 사람도 기기 계정이 생기게). */
export function addUserDevice(deviceId: string) {
  if (!canWrite()) return;
  void post(MUTATION_ADD_USER_DEVICE, { deviceId }).catch(() => {});
}
