'use client'
import { ApolloClient, ApolloLink, from, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

import { GRAPHQL_ENDPOINT } from '@/constants/graphql'
import { StorageTokenKey } from '@/types/enum/auth'
import { ReactNode } from 'react'
import {
  ApolloNextAppProvider,
  NextSSRApolloClient,
  NextSSRInMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support/ssr'

function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT, fetchOptions: { cache: 'no-store' } })

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
        : httpLink,
  })
}

export function ApolloSetting({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>
}
