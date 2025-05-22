'use server';

import { cookies } from 'next/headers';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';

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

export const execute = async <TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
) => {
  const headers = new Headers();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('ACCESS_TOKEN')?.value;

  console.log(query.toString());
  try {
    const result = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        Accept: 'application/graphql-response+json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ query: query.toString(), variables }),
    });

    const res = await result.json();

    if (res.errors && res.errors.length) {
      throw new FetchError(res as any, res.errors);
    }
    return res.data as TResult;
  } catch (error) {
    throw error;
  }
};
