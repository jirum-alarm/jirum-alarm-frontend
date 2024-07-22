'use client';
import { ApolloLink, from, fromPromise, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { StorageTokenKey } from '@/types/enum/auth';
import { ReactNode, useCallback, useEffect, useState } from 'react';
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
import { headers } from 'next/headers';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetchOptions: { cache: 'no-store', crendentials: 'include' },
});

const apolloClient = new ApolloClient({ link: httpLink, cache: new InMemoryCache() });

export function ApolloSetting({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ApolloClient<any>>();

  const makeClient = useCallback(() => {
    const getNewAccessToken = async () => {
      const token = await getRefreshToken();
      return apolloClient
        .mutate<ILoginByRefreshTokenOutput>({
          mutation: MutationLoginByRefreshToken,
          context: {
            headers: { authorization: token ? `Bearer ${token}` : '' },
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

    const authMiddleware = setContext(async (_, { headers }) => {
      const token = await getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    return new ApolloClient({
      // use the `NextSSRInMemoryCache`, not the normal `InMemoryCache`
      cache: new InMemoryCache(),
      link:
        typeof window === 'undefined'
          ? ApolloLink.from([
              new SSRMultipartLink({
                stripDefer: true,
              }),
              authMiddleware,
              linkOnError,
              httpLink,
            ])
          : ApolloLink.from([authMiddleware, linkOnError, httpLink]),
    });
  }, []);

  useEffect(() => {
    const client = makeClient();
    setClient(client);
  }, [makeClient]);

  return (
    <>
      {client && (
        <ApolloNextAppProvider makeClient={() => client}>{children}</ApolloNextAppProvider>
      )}
    </>
  );
}
