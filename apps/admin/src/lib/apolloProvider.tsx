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

import { deleteAccessToken, getAccessToken } from '@/app/actions/token';
import { reportQueryError } from '@/components/QueryErrorBanner';
import { baseUrl } from '@/constants/endpoint';

declare module '@apollo/client' {
  export interface DefaultContext {
    token?: string;
  }
}

const isServer = typeof window === 'undefined';

type Props = React.PropsWithChildren<{
  // 서버 렌더 전용. 서버에선 서버 액션을 부를 수 없어(클라 번들의 서버 액션은 fetch 프록시) 루트 레이아웃이 쿠키를 읽어 넘긴다
  ssrAccessToken?: string;
}>;

const ApolloProvider = ({ children, ssrAccessToken }: Props) => {
  const router = useRouter();

  // ApolloNextAppProvider 가 서버에선 요청(렌더 트리)마다, 브라우저에선 한 번만 부른다 — 요청 간 클라이언트 공유 없음
  const makeClient = () => {
    const authLink = setContext(async (_, { headers }) => {
      // 브라우저는 httpOnly 쿠키를 못 읽으니 기존대로 서버 액션으로 받는다(로그인 직후 새 토큰도 여기서 반영)
      const token = isServer ? ssrAccessToken : await getAccessToken();
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
      // 서버 렌더 중엔 쿠키 삭제·라우팅을 못 한다 — 같은 쿼리를 브라우저가 다시 받아 거기서 처리된다
      if (isServer) return;
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
      link: isServer
        ? ApolloLink.from([
            new SSRMultipartLink({ stripDefer: true }),
            authLink,
            linkOnError,
            httpLink,
          ])
        : ApolloLink.from([authLink, linkOnError, httpLink]),
    });
  };

  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
};

export default ApolloProvider;
