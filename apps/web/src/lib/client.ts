import { HttpLink } from '@apollo/client';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';
import { GRAPHQL_ENDPOINT } from '../constants/graphql';
import { IS_API_MOCKING } from '@/constants/env';

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: IS_API_MOCKING ? 'http://localhost:9090/graphql' : GRAPHQL_ENDPOINT,
    }),
  });
});
