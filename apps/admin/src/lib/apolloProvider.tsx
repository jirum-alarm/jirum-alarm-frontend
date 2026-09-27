'use client';

import { ApolloLink, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/experimental-nextjs-app-support';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { deleteAccessToken, getAccessToken } from '@/app/actions/token';
import { reportQueryError } from '@/components/QueryErrorBanner';
import { baseUrl } from '@/constants/endpoint';

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

    // 인증 에러는 로그인으로 보내고, 나머지는 상단 배너로 알린 뒤 컴포넌트에도 error 로 흘린다
    // (예전엔 여기서 forward(operation) 을 반환해 실패한 요청을 한 번 더 보냈다 — onError 의 forward 는 재시도다).
    const linkOnError = onError(({ graphQLErrors, networkError, operation }) => {
      if (graphQLErrors) {
        for (const err of graphQLErrors) {
          switch (err.extensions?.code) {
            case 'FORBIDDEN':
            case 'UNAUTHENTICATED':
              deleteAccessToken().then(() => {
                router.replace('/auth/signin');
              });
              return undefined;
          }
          reportQueryError(operation.operationName, err.message);
        }
      }
      if (networkError) reportQueryError(operation.operationName, networkError.message);
    });

    const httpLink = new HttpLink({
      uri: baseUrl,
      fetchOptions: { cache: 'no-store' },
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
