import { from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from '@apollo/experimental-nextjs-app-support';
import { getAccessToken } from '@/app/actions/token';
import { httpLink } from './provider/apollo';

const getAuthLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const appLink = from([httpLink]);

const makeClient = () => {
  return new ApolloClient({
    link: getAuthLink.concat(appLink),
    cache: new InMemoryCache(),
  });
};

export const { getClient, query, PreloadQuery } = registerApolloClient(makeClient);
