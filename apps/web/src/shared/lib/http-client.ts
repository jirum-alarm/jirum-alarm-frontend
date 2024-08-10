import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { TypedDocumentString } from '../api/gql/graphql';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/app/actions/token';
import { graphql } from '../api/gql';

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);
class FetchError extends Error {
  constructor(
    public response: Response,
    public data: any,
  ) {
    super(`Fetch failed with status ${response.status}`);
    this.name = 'FetchError';
    this.message = data;
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
    throw new FetchError(response, data);
  }
  return response;
}

class HttpClient {
  private baseUrl: string;
  constructor(url: string) {
    this.baseUrl = url;
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
      cache: 'no-store',
    });

    return response as { data: TResult };
  }
  private async getNewAccessToken() {
    const refreshToken = await getRefreshToken();

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        Authorization: refreshToken ? `Bearer ${refreshToken}` : '',
      },
      body: JSON.stringify({
        query: MutationLoginByRefreshToken,
      }),
    });

    const { data } = (await response.json()) as {
      data: {
        loginByRefreshToken: {
          __typename?: 'TokenOutput';
          accessToken: string;
          refreshToken?: string | null;
        };
      };
    };

    const { accessToken, refreshToken: newRefreshToken } = data.loginByRefreshToken;
    /**
     * NOTE: 서버단에서는 server action함수 사용을 못 하므로 분기처리!
     * 어차피 서버단일땐 middleware단에서 token refresh를 하므로 분기를 태워도 상관없다.
     */
    if (typeof window !== 'undefined') {
      await setAccessToken(accessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
    }

    return accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit): Promise<any> {
    const accessToken = typeof window !== 'undefined' ? await getAccessToken() : undefined;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    });

    await rejectIfNeeded(response);

    const res = await response.json();
    if (res.errors && res.errors.length) {
      for (let err of res.errors) {
        switch (err.extensions.code) {
          case 'FORBIDDEN':
          case 'UNAUTHENTICATED':
            const newAccessToken = await this.getNewAccessToken();
            const response = fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newAccessToken}`,
              },
            });
            const res = (await response).json();
            return res;
          default:
            throw new FetchError(err.message, err.extensions.response.statusCode);
        }
      }
    }

    return res;
  }
}

export const httpClient = new HttpClient(GRAPHQL_ENDPOINT);
