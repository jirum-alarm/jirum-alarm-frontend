import '@/css/satoshi.css';
import '@/css/style.css';

import { Metadata } from 'next';
import { cookies } from 'next/headers';

import ApolloProvider from '@/lib/apolloProvider';

export const metadata: Metadata = {
  title: '지름알림 어드민',
  description: '어드민 프로젝트입니다.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 서버 렌더에서 GraphQL 에 실을 토큰. 쿠키를 읽으므로 모든 화면이 요청마다 렌더된다(인증 화면이라 정적일 이유가 없다)
  const ssrAccessToken = (await cookies()).get('accessToken')?.value;

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ApolloProvider ssrAccessToken={ssrAccessToken}>{children}</ApolloProvider>
      </body>
    </html>
  );
}
