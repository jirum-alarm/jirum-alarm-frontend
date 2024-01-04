import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import { GRAPHQL_ENDPOINT } from '../constants/graphql'

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri:
        process.env.NEXT_PUBLIC_API_MOCKING === 'enable'
          ? 'http://localhost:9090/graphql'
          : GRAPHQL_ENDPOINT,
    }),
  })
})
