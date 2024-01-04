import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client'
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc'
import { GRAPHQL_ENDPOINT } from '../constants/graphql'
import { IS_API_MOCKING } from '@/constants/env'

export const { getClient } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: IS_API_MOCKING ? 'http://localhost:9090/graphql' : GRAPHQL_ENDPOINT,
    }),
  })
})
