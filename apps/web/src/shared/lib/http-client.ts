import http from 'http';
import https from 'https';

import { GRAPHQL_ENDPOINT_PROXY } from '@/shared/config/graphql';

import { TypedDocumentString } from '../api/gql/graphql';

import { generateDeviceId } from './device-id';

// HTTP Agent 설정 - Keep-Alive 및 Connection Pooling 최적화
const httpAgent = new http.Agent({
  keepAlive: true, // Keep-Alive 활성화
  keepAliveMsecs: 1000, // Keep-Alive 간격 (ms)
  maxSockets: 50, // 호스트당 최대 소켓 수
  maxFreeSockets: 10, // 유휴 소켓 최대 개수
  timeout: 60000, // 소켓 타임아웃 (ms)
});

// HTTPS Agent 설정 - Keep-Alive 및 Connection Pooling 최적화
const httpsAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 10,
  timeout: 60000,
});

/**
 * 커스텀 fetch 함수 - HTTP Agent를 사용하여 Keep-Alive 및 Connection Pooling 활성화
 * Node.js Runtime에서만 사용 가능 (Edge Runtime에서는 사용 불가)
 */
export async function customFetch(url: string, options: RequestInit = {}) {
  const urlObj = new URL(url);
  const agent = urlObj.protocol === 'https:' ? httpsAgent : httpAgent;

  return fetch(url, {
    ...options,
    // @ts-expect-error - Node.js fetch에서 agent 옵션 지원
    agent,
    headers: {
      ...options.headers,
      Connection: 'keep-alive',
    },
  });
}

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

const baseUrl = GRAPHQL_ENDPOINT_PROXY;

export async function execute<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
) {
  const isServer = typeof window === 'undefined';
  const headers = new Headers();
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/graphql-response+json');

  if (isServer) {
    const { cookies } = await import('next/headers');
    const token = (await cookies()).get('ACCESS_TOKEN')?.value;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } else {
    let deviceId = localStorage.getItem('jirum-alarm-device-id');
    if (!deviceId) {
      deviceId = generateDeviceId();
      localStorage.setItem('jirum-alarm-device-id', deviceId);
    }
    headers.set('X-Device-Id', deviceId);
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
    credentials: 'include',
  });

  await rejectIfNeeded(response);

  const responseData = await response.json();

  return responseData as { data: TResult };
}
