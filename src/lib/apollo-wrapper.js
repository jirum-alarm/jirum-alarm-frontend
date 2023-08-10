'use client'
import { ApolloClient, from, HttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
} from '@apollo/experimental-nextjs-app-support/ssr'

import { GRAPHQL_ENDPOINT } from '@/common/constant'
import { StorageTokenKey } from '@/type/enum/auth'

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
    console.log('여기서 실행..?')
    const authLink = setContext((_, { headers }) => {
      const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN)
      console.log(token)
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

export function ApolloWrapper({ children }) {
  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>
}
