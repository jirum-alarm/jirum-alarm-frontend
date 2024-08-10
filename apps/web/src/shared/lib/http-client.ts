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
  baseUrl: string;
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
    });

    return response as { data: TResult };
  }
  private async getNewAccessToken() {
    const refreshToken = await getRefreshToken();

    // 토큰 갱신 로직을 구현합니다. 여기서는 예시로 간단히 fetch를 사용합니다.
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
    if (typeof window !== 'undefined') {
      await setAccessToken(accessToken);
      if (newRefreshToken) setRefreshToken(newRefreshToken);
    }

    return accessToken;
  }

  private async fetchWithAuth(url: string, options: RequestInit): Promise<any> {
    const accessToken = await getAccessToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
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
        }
      }
    }

    return res;
  }
}

export const httpClient = new HttpClient(GRAPHQL_ENDPOINT);
