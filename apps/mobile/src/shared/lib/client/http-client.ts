import {AppState} from 'react-native';
import type {TypedDocumentString} from '@/shared/api/gql/graphql.ts';
import {getAsyncStorage} from '@/shared/lib/persistence';
import {getDeviceId} from '@/shared/lib/device/device-id';
import {StorageKey} from '@/shared/constant/storage-key.ts';
import {GRAPHQL_ENDPOINT} from '@/shared/constant/endpoint.ts';
import {graphqlEndpoint} from './screens-api';
import {waitForInitialAuth} from './initial-auth';
import {isAccessTokenUsable} from './token-expiry';

type TokenType = 'access' | 'fresh-access' | 'refresh' | null;

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

  /**
   * 누가 보든 결과가 같은 공개 조회(홈 목록 등) — 토큰 갱신을 **기다리지 않는다**.
   * 저장된 access 가 살아 있으면 붙이고(노출·검색 기록에 회원이 남게), 끝났으면 **없이** 바로 보낸다.
   *
   * 서버 JwtAuthGuard 는 만료·잘못된 토큰을 401 이 아니라 비로그인으로 처리하고, 홈 쿼리의 결과는 기기 id 기준이라
   * 로그인 여부로 안 갈린다(userId 는 기록에만). 그래서 하루 한 번 켜는 사람(토큰 만료)의 첫 화면이 갱신 왕복을
   * 기다리던 걸 없앤다. ⚠️ 결과가 사용자마다 다른 조회(내 찜·추천 키워드 등)는 withAccessToken 을 쓴다.
   */
  static withFreshAccessTokenOrNone() {
    return new HttpClient(GRAPHQL_ENDPOINT, 'fresh-access');
  }

  public async execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
  ) {
    // 운영 주소면 화면 하네스가 넣은 고정 데이터 서버 주소로 바뀔 수 있다(screens-api.ts).
    const url =
      this.baseUrl === GRAPHQL_ENDPOINT
        ? await graphqlEndpoint()
        : this.baseUrl;
    const response = await this.fetchWithAuth(url, {
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
    // 첫 갱신을 기다리지 않고 저장된 access 로 바로 보냈는가(그러다 401 이면 한 번 다시).
    let skippedInitialAuth = false;

    if (this.tokenType === 'access') {
      token = await getAsyncStorage(StorageKey.ACCESS_TOKEN);
      // ★저장된 access 가 아직 살아 있으면 콜드 스타트 첫 갱신을 기다리지 않는다(token-expiry 주석).
      skippedInitialAuth = isAccessTokenUsable(token);
      if (!skippedInitialAuth) {
        await waitForInitialAuth();
        token = await getAsyncStorage(StorageKey.ACCESS_TOKEN);
      }
    } else if (this.tokenType === 'fresh-access') {
      const stored = await getAsyncStorage(StorageKey.ACCESS_TOKEN);
      token = isAccessTokenUsable(stored) ? stored : null;
    } else if (this.tokenType === 'refresh') {
      token = await getAsyncStorage(StorageKey.REFRESH_TOKEN);
    }

    try {
      return await this.send(url, options, token);
    } catch (error) {
      // 기기 시계가 틀려 서버에선 이미 만료였던 경우 — 예전 경로(갱신을 기다린 새 토큰)로 한 번 더.
      if (!skippedInitialAuth || !isAuthFailure(error)) throw error;
      await waitForInitialAuth();
      const fresh = await getAsyncStorage(StorageKey.ACCESS_TOKEN);
      return this.send(url, options, fresh);
    }
  }

  private async send(url: string, options: RequestInit, token: string | null) {
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

/**
 * 서버가 "그런 건 없다"고 답한 실패인가(삭제·비공개 상품 등 — 운영은 originalError.statusCode 404).
 * 다시 시도해도 안 생기니 재시도하지 말고, 화면은 「네트워크 확인」이 아니라 「없다」를 말해야 한다.
 */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof FetchError && error.code === 404;
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
