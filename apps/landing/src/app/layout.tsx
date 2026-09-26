import Script from 'next/script';

import { PretendardVariable } from '@/fonts/font';

import type { Metadata } from 'next';

import '@/styles/globals.css';

const title = '지름알림: 실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!';
const description =
  '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥';
const URL_BASE = 'https://about-us.jirum-alarm.com';
// web 과 같은 GA4 스트림(jirum-alarm-web). hostName=about-us 로 갈라 본다.
// 스토어·카톡 링크 클릭은 향상된 측정의 outbound click 이 link_url 로 잡는다.
const GA_ID = 'G-EF4GWXLPC8';
export const metadata: Metadata = {
  metadataBase: new URL(URL_BASE),
  title,
  description,
  keywords:
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 쇼핑, 전자제품, 패션, 가전, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림',
  openGraph: {
    type: 'website',
    siteName: '지름알림',
    url: URL_BASE,
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

// ponytail: 평점(aggregateRating)이 없어 구글 앱 리치결과 대상은 아니다 — 검색·AI 엔진이 "무슨 앱인지" 읽는 용도.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'MobileApplication',
  name: '지름알림',
  url: URL_BASE,
  description,
  operatingSystem: 'Android, iOS',
  applicationCategory: 'ShoppingApplication',
  offers: { '@type': 'Offer', price: 0, priceCurrency: 'KRW' },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${PretendardVariable.className} antialiased`}>
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <Script id="gtag-init">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
