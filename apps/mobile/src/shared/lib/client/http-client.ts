import type {TypedDocumentString} from '@/shared/api/gql/graphql.ts';
import {getAsyncStorage} from '@/shared/lib/persistence';
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

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : '',
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
