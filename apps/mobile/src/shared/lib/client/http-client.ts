import {AppState} from 'react-native';
import type {TypedDocumentString} from '@/shared/api/gql/graphql.ts';
import {getAsyncStorage} from '@/shared/lib/persistence';
import {getDeviceId} from '@/shared/lib/device/device-id';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import {GRAPHQL_ENDPOINT} from '@/shared/constant/endpoint.ts';
import {waitForInitialAuth} from './initial-auth';

type TokenType = 'access' | 'refresh' | null;

export class HttpClient {
  private baseUrl: string;
  private tokenType: TokenType = 'access';

  constructor(baseUrl: string, tokenType: TokenType = 'access') {
    this.baseUrl = baseUrl;
    this.tokenType = tokenType;
  }

  static withNoAuth() {
    return new HttpClient(GRAPHQL_ENDPOINT, null);
  }

  static withRefreshToken() {
    return new HttpClient(GRAPHQL_ENDPOINT, 'refresh');
  }

  static withAccessToken() {
    return new HttpClient(GRAPHQL_ENDPOINT, 'access');
  }

  public async execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
  ) {
    const response = await this.fetchWithAuth(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    return response as {data: TResult};
  }

  private async fetchWithAuth(url: string, options: RequestInit) {
    let token: string | null = null;

    if (this.tokenType === 'access') {
      await waitForInitialAuth();
      token = await getAsyncStorage(StorageKey.ACCESS_TOKEN);
    } else if (this.tokenType === 'refresh') {
      token = await getAsyncStorage(StorageKey.REFRESH_TOKEN);
    }

    const deviceId = await getDeviceId();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
        // 조회 수집(collectProduct)의 사용자 식별. web 도 같은 헤더를 쓴다.
        // getDeviceId 가 없으면 만든다(게스트 계정·푸시 토큰 회수가 이걸로 기기를 가른다).
        ...(deviceId ? {'X-Device-Id': deviceId} : {}),
        // 토큰 갱신은 백그라운드에서도 돈다 — 서버가 그건 방문(lastLoggedInAt)으로 안 센다.
        ...(this.tokenType === 'refresh'
          ? {'X-App-State': AppState.currentState}
          : {}),
      },
    });
    // ★502·504 처럼 프록시가 HTML 을 돌려주면 json() 이 SyntaxError 를 던져 원인(상태 코드)이 사라졌다.
    // GraphQL 서버는 4xx 에도 JSON 본문을 주므로 본문을 먼저 읽고, 못 읽을 때만 상태로 실패시킨다.
    // (인증 실패로 분류되지 않는다 — 서버 장애로 로그아웃되면 안 된다)
    const res = await response.json().catch(() => {
      throw new Error(`HTTP ${response.status} — GraphQL 응답이 JSON 이 아님`);
    });
    await rejectIfNeeded(res);
    return res;
  }
}

export class FetchError extends Error {
  name: string;
  response: GraphQLError;
  code: null | number | string;
  constructor(response: GraphQLError) {
    // ★originalError 는 Nest HttpException 에만 붙는다. 검증 오류·일반 Error 엔 없어서
    // 예전엔 생성자가 TypeError 로 죽고 서버 메시지가 사라졌다.
    const original = response.extensions?.originalError;
    super(original?.message ?? response.message);

    this.name = 'FetchError';
    // 숫자 상태가 없으면 GraphQL 코드 문자열(예: 'BAD_USER_INPUT') — isAuthFailure 는 숫자만 본다.
    this.code = original?.statusCode ?? response.extensions?.code ?? null;
    this.response = response;
  }
}

/**
 * 서버가 "이 토큰은 안 된다"고 답한 실패인가. 잘못된·만료된 refresh token 에
 * 서버는 FORBIDDEN(403)을 준다(운영 실측 2026-09-25). 네트워크 실패는 fetch 가
 * TypeError 를 던지므로 여기 걸리지 않는다 — 둘을 섞으면 연결이 잠깐 끊겨도 로그아웃된다.
 */
export function isAuthFailure(error: unknown): boolean {
  return (
    error instanceof FetchError && (error.code === 401 || error.code === 403)
  );
}

async function rejectIfNeeded(response: GraphQLErrorResponse) {
  if (response.errors) {
    for (const error of response.errors) {
      throw new FetchError(error);
    }
  }
  return response;
}

interface GraphQLErrorResponse {
  errors: GraphQLError[];
}

interface GraphQLError {
  extensions?: {
    code?: string;
    originalError?: OriginalError;
  };
  message: string;
}

interface OriginalError {
  error: string;
  message: string;
  statusCode: number;
}
