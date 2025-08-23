import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from './env';

const title = '지름알림: 실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!';
const description =
  '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥';

export const defaultMetadata: Metadata = {
  metadataBase: new URL(METADATA_SERVICE_URL),
  title,
  description,
  appleWebApp: true,
  keywords:
    '실시간, 핫딜, 할인, 초특가, 최저가, 알뜰, 쇼핑, 전자제품, 패션, 가전, 알뜰쇼핑, 쿠폰, 이벤트, 지름알림, 핫딜알림',
  openGraph: {
    title,
    description,
    type: 'website',
    url: METADATA_SERVICE_URL,
    siteName: '지름알림',
    images: [
      {
        url: `${METADATA_SERVICE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: `${METADATA_SERVICE_URL}/opengraph-image.png`,
  },
  icons: {
    icon: `${METADATA_SERVICE_URL}/icon.png`,
    apple: [{ url: '/apple-touch-icon.png' }],
  },
  alternates: {
    canonical: METADATA_SERVICE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '지름알림',
  description,
  url: METADATA_SERVICE_URL,
  potentialAction: [
    {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${METADATA_SERVICE_URL}/search?keyword={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  ],
  image: {
    '@type': 'ImageObject',
    url: `${METADATA_SERVICE_URL}/opengraph-image.png`,
    width: 1200,
    height: 630,
  },
};

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '지름알림',
  url: METADATA_SERVICE_URL,
  sameAs: [
    'https://apps.apple.com/kr/app/id6474611420',
    'https://play.google.com/store/apps/details?id=com.solcode.jirmalam',
    'https://www.instagram.com/jirumalarm_',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
  },
};
