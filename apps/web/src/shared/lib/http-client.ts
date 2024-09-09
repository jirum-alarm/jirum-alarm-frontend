import { graphql } from '../api/gql';
import { TypedDocumentString } from '../api/gql/graphql';

import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/app/actions/token';
import { GRAPHQL_ENDPOINT } from '@/constants/graphql';

const MutationLoginByRefreshToken = graphql(`
  mutation QueryLoginByRefreshToken {
    loginByRefreshToken {
      accessToken
      refreshToken
    }
  }
`);

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
export class FetchError extends Error {
  constructor(
    public response: customGraphqlResponse,
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
    throw new FetchError(response as customGraphqlResponse, data);
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
    const response = await this.fetchWithAuth(
      this.baseUrl,
      {
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
      },
      false,
    );

    return response as { data: TResult };
  }

  /**
   * @description 서버 컴포넌트에서 사용해야할 함수
   */
  public async server_execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    ...[variables]: TVariables extends Record<string, never> ? [] : [TVariables]
  ) {
    const response = await this.fetchWithAuth(
      this.baseUrl,
      {
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
      },
      true,
    );

    return response as { data: TResult };
  }

  private isServer() {
    return typeof window === 'undefined';
  }

  private getCookieValue(name: string) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : null;
  }

  private async getNewAccessToken() {
    /**
     * NOTE: 서버단에서는 middleware단에서 token refresh를 하므로 return
     */
    if (this.isServer()) return;
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
    if (data.loginByRefreshToken) return;
    const { accessToken, refreshToken: newRefreshToken } = data.loginByRefreshToken;

    await setAccessToken(accessToken);
    if (newRefreshToken) setRefreshToken(newRefreshToken);

    return accessToken;
  }

  private async fetchWithAuth(
    url: string,
    options: RequestInit,
    isServerComponent: boolean,
  ): Promise<any> {
    const accessToken = isServerComponent
      ? await getAccessToken()
      : !this.isServer()
        ? this.getCookieValue('ACCESS_TOKEN')
        : undefined;

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
      for (const err of res.errors) {
        switch (err.extensions.code) {
          case 'FORBIDDEN':
          case 'UNAUTHENTICATED':
            const newAccessToken = await this.getNewAccessToken();
            const newResponse = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: newAccessToken ? `Bearer ${newAccessToken}` : '',
              },
            });
            await rejectIfNeeded(newResponse);
            const newRes = await newResponse.json();
            if (!newRes.data) throw new FetchError(newRes, newRes.errors);
            return newRes;
          default:
            throw new FetchError(res, res.errors);
        }
      }
    }

    return res;
  }
}

export const httpClient = new HttpClient(GRAPHQL_ENDPOINT);
