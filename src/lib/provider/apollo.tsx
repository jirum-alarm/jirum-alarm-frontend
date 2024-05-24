'use client';
import {
  ApolloClient,
  ApolloLink,
  from,
  fromPromise,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { StorageTokenKey } from '@/types/enum/auth';
import { ReactNode } from 'react';
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';
import { onError } from '@apollo/client/link/error';
import { ILoginByRefreshTokenOutput } from '@/types/login';
import { MutationLoginByRefreshToken } from '@/graphql/auth';

const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT, credentials: 'include' });

const apolloClient = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });

const getNewAccessToken = async () => {
  const token = localStorage.getItem(StorageTokenKey.REFRESH_TOKEN);
  return apolloClient
    .mutate<ILoginByRefreshTokenOutput>({
      mutation: MutationLoginByRefreshToken,
      context: {
        headers: { authorization: token ? `Bearer ${token}` : '' },
      },
    })
    .then((res) => {
      if (!res.data) return;
      const { accessToken, refreshToken } = res.data.loginByRefreshToken;
      localStorage.setItem(StorageTokenKey.ACCESS_TOKEN, accessToken);
      if (refreshToken) {
        localStorage.setItem(StorageTokenKey.REFRESH_TOKEN, refreshToken);
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

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN);
  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : '',
    },
  });
  return forward(operation);
});

function makeClient() {
  return new NextSSRApolloClient({
    // use the `NextSSRInMemoryCache`, not the normal `InMemoryCache`
    cache: new NextSSRInMemoryCache(),
    link:
      typeof window === 'undefined'
        ? ApolloLink.from([
            // in a SSR environment, if you use multipart features like
            // @defer, you need to decide how to handle these.
            // This strips all interfaces with a `@defer` directive from your queries.
            new SSRMultipartLink({
              stripDefer: true,
            }),
            httpLink,
          ])
        : from([authMiddleware, linkOnError, httpLink]),
  });
}

export function ApolloSetting({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
