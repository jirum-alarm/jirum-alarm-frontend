'use client';
import { ApolloLink, concat, HttpLink } from '@apollo/client';

import { GRAPHQL_ENDPOINT } from '@/constants/graphql';
import { StorageTokenKey } from '@/types/enum/auth';
import { ReactNode } from 'react';
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr';

const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

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
        : concat(authMiddleware, httpLink),
  });
}

export function ApolloSetting({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
}
