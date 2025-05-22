'use server';

import { cookies } from 'next/headers';

import { IS_PRD } from '@/constants/env';
import { graphql } from '@/shared/api/gql';

import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken } from './token';

const GRAPHQL_ENDPOINT =
  process.env.GRAPHQL_ENDPOINT ??
  (IS_PRD
    ? 'http://crawling-server-lb.crawling-server.svc.cluster.local:3100/graphql'
    : 'http://crawling-server-lb.crawling-server-dev.svc.cluster.local:3100/graphql');

const isServer = () => {
  return typeof window === 'undefined';
};

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

async function getNewAccessToken() {
  /**
   * NOTE: 서버단에서는 middleware단에서 token refresh를 하므로 return
   */
  if (isServer()) return;
  const refreshToken = await getRefreshToken();
  const response = await fetch(GRAPHQL_ENDPOINT, {
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
  if (!data?.loginByRefreshToken) return;
  const { accessToken, refreshToken: newRefreshToken } = data.loginByRefreshToken;

  await setAccessToken(accessToken);
  if (newRefreshToken) await setRefreshToken(newRefreshToken);

  return accessToken;
}

export async function requestGraphQL(query: string, variables: any) {
  const cookieStore = await cookies();

  const accessToken = !isServer() ? cookieStore.get('ACCESS_TOKEN')?.value : undefined;

  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/graphql-response+json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const res = await response.json();

  if (res.errors && res.errors.length) {
    for (const err of res.errors) {
      switch (err.extensions.code) {
        case 'FORBIDDEN':
        case 'UNAUTHENTICATED':
          const newAccessToken = await getNewAccessToken();
          const newResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/graphql-response+json',
              ...(newAccessToken ? { Authorization: `Bearer ${newAccessToken}` } : {}),
            },
            body: JSON.stringify({ query, variables }),
          });
          await rejectIfNeeded(newResponse);
          const newRes = await newResponse.json();
          if (!newRes.data) throw new FetchError(newRes, newRes.errors);
          return newRes;
        default:
          console.log(query, res);
          throw new FetchError(res, res.errors);
      }
    }
  }

  return res;
}
