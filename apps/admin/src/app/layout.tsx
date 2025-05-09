import '@/css/satoshi.css';
import '@/css/style.css';

import { Metadata } from 'next';

import ApolloProvider from '@/lib/apolloProvider';

export const metadata: Metadata = {
  title: '지름알림 어드민',
  description: '어드민 프로젝트입니다.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ApolloProvider>{children}</ApolloProvider>
      </body>
    </html>
  );
}
