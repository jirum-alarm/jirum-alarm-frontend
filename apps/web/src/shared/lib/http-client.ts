import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { TypedDocumentString } from '../api/gql/graphql';

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
    const response = await fetch(this.baseUrl, {
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

    rejectIfNeeded(response);

    const res = (await response.json()) as { data: TResult };
    return res;
  }
}

export const httpClient = new HttpClient(GRAPHQL_ENDPOINT);
