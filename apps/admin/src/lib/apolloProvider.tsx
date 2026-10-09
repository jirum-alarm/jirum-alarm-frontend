'use client';

import { ApolloLink, CombinedGraphQLErrors, HttpLink } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import {
  ApolloClient,
  ApolloNextAppProvider,
  InMemoryCache,
  SSRMultipartLink,
} from '@apollo/client-integration-nextjs';
import { useRouter } from 'next/navigation';
import { Observable } from 'rxjs';

import { deleteAccessToken, getAccessToken, renewAccessToken } from '@/app/actions/token';
import { reportQueryError } from '@/components/QueryErrorBanner';
import { baseUrl } from '@/constants/endpoint';

declare module '@apollo/client' {
  export interface DefaultContext {
    token?: string;
    authRetried?: boolean;
  }
}

const isServer = typeof window === 'undefined';

// 쿼리 여러 개가 한꺼번에 FORBIDDEN 을 받아도 refresh 는 한 번만
let renewing: Promise<string | undefined> | null = null;
const renewOnce = () => {
  renewing ??= renewAccessToken().finally(() => {
    renewing = null;
  });
  return renewing;
};

const ApolloProvider = ({ children }: React.PropsWithChildren) => {
  const router = useRouter();

  // ApolloNextAppProvider 가 서버에선 요청(렌더 트리)마다, 브라우저에선 한 번만 부른다 — 요청 간 클라이언트 공유 없음
  const makeClient = () => {
    const authLink = new SetContextLink(async ({ headers }) => {
      // 서버 렌더엔 토큰을 싣지 않는다 — 넘기려면 prop 으로 RSC payload(HTML)에 실려 httpOnly 가 무의미해진다.
      // 서버에서 인증 쿼리를 도는 건 useSuspenseQuery 화면뿐이라, 그건 FORBIDDEN 뒤 브라우저가 다시 받는다.
      // 브라우저는 httpOnly 쿠키를 못 읽으니 서버 액션으로 받는다(로그인 직후 새 토큰도 여기서 반영)
      const token = isServer ? undefined : await getAccessToken();
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    // 인증 에러(만료 토큰도 서버는 FORBIDDEN 으로 준다)는 refresh 로 새 토큰을 받아 한 번만 다시 보낸다.
    // 새 토큰으로도 FORBIDDEN 이면 만료가 아니라 권한(섹션) 문제 — 로그아웃시키지 않고 배너로 알린다.
    // refresh 자체가 거절될 때만 로그인으로 보낸다. 나머지 에러는 상단 배너 + 컴포넌트 error.
    const linkOnError = new ErrorLink(({ error, operation, forward }) => {
      // 서버 렌더 중엔 쿠키 삭제·라우팅을 못 한다 — 같은 쿼리를 브라우저가 다시 받아 거기서 처리된다
      if (isServer) return;
      // Apollo 4: GraphQL 에러는 CombinedGraphQLErrors 로, 나머지(네트워크·HTTP·파싱)는 그 밖의 Error 로 온다
      const graphQLErrors = CombinedGraphQLErrors.is(error) ? error.errors : undefined;
      // Apollo 4 는 익명 오퍼레이션의 이름을 undefined 로 준다(3 은 '')
      const opName = operation.operationName ?? '';
      const authError = graphQLErrors?.some((err) =>
        ['FORBIDDEN', 'UNAUTHENTICATED'].includes(err.extensions?.code as string),
      );
      if (authError && !operation.getContext().authRetried) {
        return new Observable((observer) => {
          renewOnce()
            .then((token) => {
              if (!token) {
                deleteAccessToken().then(() => router.replace('/auth/signin'));
                observer.error(new Error('로그인이 만료되었습니다'));
                return;
              }
              operation.setContext(({ headers }: { headers?: Record<string, string> }) => ({
                authRetried: true,
                headers: { ...headers, authorization: `Bearer ${token}` },
              }));
              forward(operation).subscribe(observer);
            })
            .catch((err: Error) => {
              // refresh 서버 장애 — 로그아웃시키지 않는다
              reportQueryError(opName, err.message);
              observer.error(err);
            });
        });
      }
      if (graphQLErrors) {
        graphQLErrors.forEach((err) => reportQueryError(opName, err.message));
      } else {
        reportQueryError(opName, error.message);
      }
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
      // Apollo 4 는 기본값이 true 라 fetchMore·refetch 중에도 loading 이 켜진다 → `if (loading) <Spinner>` 목록이
      // 무한 스크롤마다 통째로 사라진다. 3 의 기본값(false)으로 되돌린다. 로딩을 보여야 하는 lazy 훅은 각자 true.
      defaultOptions: { watchQuery: { notifyOnNetworkStatusChange: false } },
    });
  };

  return <ApolloNextAppProvider makeClient={makeClient}>{children}</ApolloNextAppProvider>;
};

export default ApolloProvider;
