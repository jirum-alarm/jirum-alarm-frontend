import { from, fromPromise } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
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
import { apolloClient, httpLink } from './provider/apollo';

const getAuthLink = setContext(async (_, { headers }) => {
  const token = await getAccessToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const getNewAccessToken = async () => {
  const refreshToken = await getRefreshToken();
  return apolloClient
    .mutate<ILoginByRefreshTokenOutput>({
      mutation: MutationLoginByRefreshToken,
      context: {
        headers: { authorization: refreshToken ? `Bearer ${refreshToken}` : '' },
      },
    })
    .then(async (res) => {
      if (!res.data) return;
      const { accessToken, refreshToken } = res.data.loginByRefreshToken;
      fetch(
        `http://localhost:3000/api/token?access_token=${accessToken}&refresh_token=${refreshToken}`,
      );
      // await setAccessToken(accessToken);
      // if (refreshToken) {
      // await setRefreshToken(refreshToken);
      // }
      return accessToken;
    });
};

const linkOnError = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      switch (err.extensions.code) {
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

const appLink = from([linkOnError, httpLink]);

const makeClient = () => {
  return new ApolloClient({
    link: getAuthLink.concat(appLink),
    cache: new InMemoryCache(),
  });
};

export const { getClient, query, PreloadQuery } = registerApolloClient(makeClient);
