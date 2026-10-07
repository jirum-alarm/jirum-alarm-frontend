import '@/css/satoshi.css';
import '@/css/style.css';

import { Metadata, Viewport } from 'next';

import ApolloProvider from '@/lib/apolloProvider';

export const metadata: Metadata = {
  title: '지름알림 어드민',
  description: '어드민 프로젝트입니다.',
  // 홈 화면에 추가한 아이콘으로 열면 주소창 없이 앱처럼 뜬다(iOS)
  appleWebApp: { capable: true, title: '지름 어드민', statusBarStyle: 'default' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // 노치·홈 인디케이터 밑까지 그리고, 안쪽 여백은 safe-area 로 직접 준다(헤더·하단 탭)
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <body suppressHydrationWarning={true}>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
