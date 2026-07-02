import { GRAPHQL_ENDPOINT, GRAPHQL_ENDPOINT_PROXY } from '@/shared/config/graphql';

import { TypedDocumentString } from '../api/gql/graphql';

import { generateDeviceId } from './device-id';

type customGraphqlResponse = Response & {
  errors: Array<{
    message: string;
    extensions: {
      code: string;
      response: {
        message: string;
        error: string;
        statusCode: number;
      };
    };
  }>;
};

class FetchError extends Error {
  constructor(
    public response: customGraphqlResponse,
    public data: any,
  ) {
    super(`Fetch failed with status ${response.status}`);
    this.name = 'FetchError';
    this.message = JSON.stringify({ data });
  }
}

async function rejectIfNeeded(response: Response) {
  if (!response.ok) {
    let data;
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    throw new FetchError(response as customGraphqlResponse, data);
  }
  return response;
}

/**
 * fetch 옵션. 기본은 인증 포함 + no-store(요청별 동적). public 모드는 ★ISR 핵심:
 * 서버에서 cookies()를 읽지 않아(=동적 렌더 강제 해제) 라우트가 정적/ISR 캐시될 수 있고,
 * no-store 대신 next.revalidate 로 데이터 캐시. 비로그인 공개 쿼리(예: /deals SEO 페이지)에만 쓴다.
 */
export interface ExecuteOptions {
  /** true 면 서버에서 cookies()를 건너뛴다(토큰/인증 불필요한 공개 쿼리). 라우트 정적 렌더 허용. */
  public?: boolean;
  /** public 일 때 data cache TTL(초). 미지정이면 no-store 유지. */
  revalidate?: number;
}

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables, opts]: TVariables extends Record<string, never>
    ? [undefined?, ExecuteOptions?]
    : [TVariables, ExecuteOptions?]
) {
  const isServer = typeof window === 'undefined';
  // SSR은 내부 API를 직통(GRAPHQL_ENDPOINT)으로 부른다. 프록시(/api/graphql)는 자기 외부도메인이라
  // dev/staging에선 그 왕복이 istio authentik 게이트에 막혀 302/로그인HTML을 받아 상세가 깨졌다.
  // (브라우저는 쿠키가 자동 동봉돼 프록시 OK, 서버는 아래에서 쿠키→Authorization 직접 세팅한다.)
  const baseUrl = isServer ? GRAPHQL_ENDPOINT : GRAPHQL_ENDPOINT_PROXY;
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/graphql-response+json');

  // ★public 모드: 서버에서 cookies()를 절대 호출하지 않는다. cookies() 호출 자체가
  //   Next 를 동적 렌더로 옵트아웃시켜 ISR/정적 캐시를 무력화하기 때문(no-store 가 아니라 이게 진범).
  if (isServer && !opts?.public) {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('ACCESS_TOKEN')?.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    const deviceId = cookieStore.get('jirum-alarm-device-id')?.value;
    if (deviceId) {
      headers.set('X-Device-Id', deviceId);
    }
  } else if (!isServer) {
    let deviceId = localStorage.getItem('jirum-alarm-device-id');
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem('jirum-alarm-device-id', deviceId);
    }
    headers.set('X-Device-Id', deviceId);
  }

  // public+revalidate 면 data cache 사용(next.revalidate), 그 외엔 기존대로 no-store.
  const cacheOption: Pick<RequestInit, 'cache' | 'next'> =
    opts?.public && opts.revalidate != null
      ? { next: { revalidate: opts.revalidate } }
      : { cache: 'no-store' };

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    ...cacheOption,
    credentials: 'include',
  });

  await rejectIfNeeded(response);

  const responseData = await response.json();

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    throw new FetchError(response as customGraphqlResponse, responseData);
  }

  return responseData as { data: TResult };
}
