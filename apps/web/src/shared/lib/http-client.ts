import { GRAPHQL_ENDPOINT_PROXY } from '@/constants/graphql';

import { TypedDocumentString } from '../api/gql/graphql';

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
