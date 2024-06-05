import { ApolloClient, createHttpLink, from, fromPromise, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import { GRAPHQL_ENDPOINT } from '../constants/graphql';

import { StorageTokenKey } from '@/types/enum/auth';
import { ApiType } from '@/types/enum/common';
import { getAccessToken, isAccessTokenExpired, isRefreshTokenExpired } from './auth';
import { PAGE } from '@/constants/page';

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (networkError) {
    return;
  }

  if (!graphQLErrors) {
    return;
  }

  for (const graphQLError of graphQLErrors) {
  }

  if (isRefreshTokenExpired()) {
    localStorage.removeItem(StorageTokenKey.ACCESS_TOKEN);
    localStorage.removeItem(StorageTokenKey.REFRESH_TOKEN);
    window.location.replace(PAGE.LOGIN);
    return;
  }

  const isExpiredToken =
    graphQLErrors.find(({ message, extensions }) => {
      return (
        extensions?.code === 'UNAUTHENTICATED' ||
        (extensions?.code === 'FORBIDDEN' &&
          message === 'Forbidden resource' &&
          isAccessTokenExpired())
      );
    }) !== undefined;

  if (networkError) {
  }
  if (isExpiredToken) {
    return fromPromise(
      getAccessToken().catch((error) => {
        return;
      }),
    )
      .filter(Boolean)
      .flatMap((accessToken) => {
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
});

const apiSeverLink = createHttpLink({
  uri: GRAPHQL_ENDPOINT,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(StorageTokenKey.ACCESS_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: headers?.authorization ?? `Bearer ${token}`,
    },
  };
});

export const client = new ApolloClient({
  link: from([
    errorLink,
    authLink.split((operation) => operation.getContext().clientName === ApiType.API, apiSeverLink),
  ]),
  cache: new InMemoryCache(),
});
