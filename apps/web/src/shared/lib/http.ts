import { SERVICE_URL } from '@/constants/env';

import { TypedDocumentString } from '../api/gql/graphql';

const headers = {
  credentials: 'include',
  'Content-Type': 'application/json',
  Accept: 'application/graphql-response+json',
  // TODO: 해당 속성 추가 필요
  // 'X-distinct-id': '',
  // 'X-FCM-token': '',
};

async function executeBase<TResult, TVariables>(
  query: TypedDocumentString<TResult, TVariables>,
  variables?: TVariables,
  options?: {
    cookieHeader?: string;
    fcmToken?: string;
  },
) {
  try {
    const response = await fetch(SERVICE_URL + '/graphql', {
      method: 'POST',
      headers: {
        ...headers,
        ...(options?.cookieHeader ? { Cookie: options.cookieHeader } : {}),
        ...(options?.fcmToken ? { 'X-FCM-token': options.fcmToken } : {}),
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new FetchError(response as customGraphqlResponse, { query, variables });
    }

    let data;
    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      data = (await response.json()).data;
    } else {
      data = await response.text();
    }
    return data as TResult;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

class Http {
  private fcmToken?: string;

  public setFcmToken(fcmToken?: string) {
    console.log('setFcmToken', fcmToken);
    this.fcmToken = fcmToken;
  }

  public async execute<TResult, TVariables>(
    query: TypedDocumentString<TResult, TVariables>,
    variables?: TVariables,
  ) {
    return executeBase(query, variables, { fcmToken: this.fcmToken });
  }

  public async executeServer<TResult, TVariables>(
    cookieHeader: string,
    query: TypedDocumentString<TResult, TVariables>,
    variables?: TVariables,
  ) {
    return executeBase(query, variables, {
      cookieHeader,
      fcmToken: this.fcmToken,
    });
  }
}

export const http = new Http();

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
    this.message = JSON.stringify({ data });
  }
}
