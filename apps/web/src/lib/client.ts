import { from, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';

import { getAccessToken } from '@/app/actions/token';
import { GRAPHQL_ENDPOINT } from '@/constants/graphql';

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  fetchOptions: { cache: 'no-store', credentials: 'include' },
});

const getAuthLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const makeClient = () => {
  return new ApolloClient({
    link: getAuthLink.concat(from([httpLink])),
    cache: new InMemoryCache(),
  });
};

export const { getClient, query, PreloadQuery } = registerApolloClient(makeClient);
