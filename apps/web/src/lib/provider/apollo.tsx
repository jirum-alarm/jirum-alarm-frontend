'use client';
import { ApolloLink, fromPromise, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';
import { onError } from '@apollo/client/link/error';
import { ILoginByRefreshTokenOutput } from '@/types/login';
import { MutationLoginByRefreshToken } from '@/graphql/auth';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '@/app/actions/token';
import { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetchOptions: { cache: 'no-store', crendentials: 'include' },
});

export const apolloClient = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });

const getAuthLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const getNewAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  return apolloClient
    .mutate<ILoginByRefreshTokenOutput>({
      mutation: MutationLoginByRefreshToken,
      context: {
        headers: { authorization: refreshToken ? `Bearer ${refreshToken}` : '' },
      },
    })
    .then(async (res) => {
      if (!res.data) return;
      const { accessToken, refreshToken } = res.data.loginByRefreshToken;
      await setAccessToken(accessToken);
      if (refreshToken) {
        await setRefreshToken(refreshToken);
      }
      return accessToken;
    });
};

const linkOnError = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      switch (err.extensions.code) {
        // Apollo Server sets code to UNAUTHENTICATED
        // when an AuthenticationError is thrown in a resolver
        case 'FORBIDDEN':
        case 'UNAUTHENTICATED':
          const refresh = fromPromise(
            getNewAccessToken().catch((error) => {
              throw error;
            }),
          );
          // Retry the request, returning the new observable
          return refresh.filter(Boolean).flatMap((accessToken) => {
            // Modify the operation context with a new token
            const oldHeaders = operation.getContext().headers;
            operation.setContext({
              headers: {
                ...oldHeaders,
                authorization: `Bearer ${accessToken}`,
              },
            });
            return forward(operation);
          });
      }
    }
  }

  // To retry on network errors, we recommend the RetryLink
  // instead of the onError link. This just logs the error.
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

const makeClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            getAuthLink,
            linkOnError,
            httpLink,
          ])
        : ApolloLink.from([getAuthLink, linkOnError, httpLink]),
  });
};
export function ApolloProvider({ children }: Props) {
  const [client, setClient] = useState<any>();
  useEffect(() => {
    setClient(makeClient());
  }, []);
  return (
    <>
      {client && (
        <ApolloNextAppProvider makeClient={() => client}>{children}</ApolloNextAppProvider>
      )}
    </>
  );
}
