'use client';
import { redirect, useRouter } from 'next/navigation';
import { baseUrl } from '@/constants/endpoint';
import { setContext } from '@apollo/client/link/context';
import { ApolloLink, HttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';
import { deleteAccessToken, getAccessToken } from '@/app/actions/token';
import { useCallback, useEffect, useState } from 'react';

declare module '@apollo/client' {
  export interface DefaultContext {
    token?: string;
  }
}

const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();
  const [client, setClient] = useState<ApolloClient<any>>();

  const makeClient = useCallback(() => {
    const authLink = setContext(async (_, { headers }) => {
      const token = await getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    const linkOnError = onError(({ graphQLErrors, operation, forward }) => {
      if (graphQLErrors) {
        for (let err of graphQLErrors) {
          switch (err.extensions.code) {
            case 'FORBIDDEN':
            case 'UNAUTHENTICATED':
              deleteAccessToken().then(() => {
                router.replace('/auth/signin');
              });
              return undefined;
          }
        }
      }
      return forward(operation);
    });

    const httpLink = new HttpLink({
      uri: baseUrl,
      fetchOptions: { cache: 'no-store', crendentials: 'include' },
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      link:
        typeof window === 'undefined'
          ? ApolloLink.from([
              new SSRMultipartLink({ stripDefer: true }),
              authLink,
              linkOnError,
              httpLink,
            ])
          : ApolloLink.from([authLink, linkOnError, httpLink]),
    });
  }, [router]);

  useEffect(() => {
    const client = makeClient();
    setClient(client);
  }, [makeClient]);

  return (
    <>
      {client && (
        <ApolloNextAppProvider makeClient={() => client}>{children}</ApolloNextAppProvider>
      )}
    </>
  );
};

export default ApolloProvider;
