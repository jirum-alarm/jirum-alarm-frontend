import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from './env';

const title = '지름알림: 실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!';
const description =
  '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥';
const applicationName = '지름알림';
const siteName = '지름알림';
const locale = 'ko_KR';
const defaultCategory = '쇼핑/핫딜';
const defaultClassification = '쇼핑 핫딜 정보 플랫폼';
const contactEmail = 'jirumalarm@gmail.com';
const ogImageUrl = `${METADATA_SERVICE_URL}/opengraph-image.webp`;
const iconUrl = `${METADATA_SERVICE_URL}/icon.png`;
const appleTouchIconUrl = `${METADATA_SERVICE_URL}/apple-touch-icon.png`;
const defaultKeywords = [
  '실시간',
  '핫딜',
  '할인',
  '초특가',
  '최저가',
  '알뜰',
  '쇼핑',
  '전자제품',
  '생활용품',
  '식음료',
  '패션',
  '가전',
  '알뜰쇼핑',
  '쿠폰',
  '이벤트',
  '지름알림',
  '핫딜알림',
];
const keywords = defaultKeywords.join(', ');

export const defaultMetadata: Metadata = {
  metadataBase: new URL(METADATA_SERVICE_URL),
  title,
  description,
  applicationName,
  manifest: '/manifest.webmanifest',
  publisher: siteName,
  creator: siteName,
  category: defaultCategory,
  classification: defaultClassification,
  appleWebApp: {
    capable: true,
    title: applicationName,
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  keywords,
  openGraph: {
    title,
    description,
    type: 'website',
    url: METADATA_SERVICE_URL,
    siteName,
    locale,
    images: [
      {
        url: ogImageUrl,
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
    images: ogImageUrl,
  },
  icons: {
    icon: iconUrl,
    shortcut: iconUrl,
    apple: [{ url: appleTouchIconUrl }],
  },
  alternates: {
    canonical: METADATA_SERVICE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'platform:name': siteName,
    'platform:contact': contactEmail,
  },
};

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
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
    url: ogImageUrl,
    width: 1200,
    height: 630,
  },
  publisher: {
    '@type': 'Organization',
    name: siteName,
    logo: {
      '@type': 'ImageObject',
      url: iconUrl,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: contactEmail,
        contactType: 'customer service',
        availableLanguage: ['ko'],
      },
    ],
  },
};

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: METADATA_SERVICE_URL,
  logo: {
    '@type': 'ImageObject',
    url: ogImageUrl,
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      email: contactEmail,
      contactType: 'customer service',
      availableLanguage: ['ko'],
    },
  ],
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
