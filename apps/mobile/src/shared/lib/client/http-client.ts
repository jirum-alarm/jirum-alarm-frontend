import type {TypedDocumentString} from '@/shared/api/gql/graphql.ts';
import {getAsyncStorage} from '@/shared/lib/persistence';
import {getDeviceId} from '@/shared/lib/device/device-id';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import {GRAPHQL_ENDPOINT} from '@/shared/constant/endpoint.ts';

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
        // 없으면 안 보낸다 — 틀린 id 를 만들어 보내면 집계가 쪼개진다.
        ...(deviceId ? {'X-Device-Id': deviceId} : {}),
      },
    });
    const res = await response.json();
    await rejectIfNeeded(res);
    return res;
  }
}

export class FetchError extends Error {
  name: string;
  response: GraphQLError;
  code: null | number | string;
  constructor(response: GraphQLError) {
    super(response.extensions.originalError.message);

    this.name = 'FetchError';
    this.code = response.extensions.originalError.statusCode;
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
  extensions: {
    code: string;
    originalError: OriginalError;
  };
  message: string;
}

interface OriginalError {
  error: string;
  message: string;
  statusCode: number;
}
