import { PretendardVariable } from '@/fonts/font';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const title = '지름알림: 실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!';
const description =
  '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥';
const URL_BASE = 'https://about-us.jirum-alarm.com';
export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title,
  description,
  keywords:
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 쇼핑, 전자제품, 패션, 가전, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림',
  openGraph: {
    type: 'website',
    siteName: '지름알림',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: `${URL_BASE}/opengraph-image.png`,
  },
  alternates: {
    canonical: URL_BASE,
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${PretendardVariable.className} relative max-h-lvh min-h-svh snap-y snap-mandatory antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
