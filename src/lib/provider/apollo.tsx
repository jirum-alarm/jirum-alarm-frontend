'use client'
import { ApolloClient, from, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
} from '@apollo/experimental-nextjs-app-support/ssr'

import { GRAPHQL_ENDPOINT } from '@/constants/graphql'
import { StorageTokenKey } from '@/types/enum/auth'
import { ReactNode } from 'react'

function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT })

  let link
  // if (typeof window !== 'undefined') {
  //   const wsLink = new GraphQLWsLink(
  //     createClient({
  //       url: GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
  //     }),
  //   )

  //   link = split(
  //     ({ query }) => {
  //       const def = getMainDefinition(query)
  //       return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  //     },
  //     wsLink,
  //     httpLink,
  //   )
  // } else

  if (typeof window !== 'undefined') {
    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN)
      return {
        headers: {
          ...headers,
          authorization: headers?.authorization ?? `Bearer ${token}`,
        },
      }
    })

    link = from([authLink.split((operation) => true, httpLink)])
  } else if (typeof window === 'undefined') {
    link = httpLink
  } else {
    link = httpLink
  }

  return new ApolloClient({ cache: new NextSSRInMemoryCache(), link })
}

export function ApolloSetting({ children }: { children: ReactNode }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>
}
