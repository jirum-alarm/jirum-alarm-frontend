import { COMMUNITY_COUNT } from '@jirum/domain/service-facts';
import { Metadata } from 'next';

import { IS_INDEXABLE_DEPLOYMENT, METADATA_SERVICE_URL } from './env';

/**
 * 전 라우트 공통 robots 지시. **라우트가 `robots` 를 직접 쓸 때도 이걸 써야 한다** —
 * 상품 상세가 `{ index: true }` 를 하드코딩해서 dev 에서도 색인 허용으로 나갔다.
 * 헤더 쪽 정본은 middleware 의 `X-Robots-Tag`(모든 응답을 덮는다).
 */
export const robotsDirective = IS_INDEXABLE_DEPLOYMENT
  ? { index: true, follow: true }
  : { index: false, follow: false };

// 홈·기본 제목과 설명은 사람들이 실제로 치는 검색 표현(핫딜 모음·핫딜 사이트·핫딜 알림·핫딜 앱)을 그대로 담는다.
// 전 문구 「실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!」은 브랜드 질의 밖에선 네이버 AI 브리핑·구글 1페이지에
// 걸리지 않았다(2026-10-23 실측, 판독 obs_seo_home_title_generic). (home)/page.tsx 의 og·twitter 와 HomeContainerV2 의 h1 이 같은 값을 쓴다.
export const homeTitle = `지름알림 — 커뮤니티 ${COMMUNITY_COUNT} 핫딜 모음 사이트, 실시간 핫딜 알림 앱`;
export const homeDescription = `뽐뿌·에펨코리아 등 커뮤니티 ${COMMUNITY_COUNT}의 핫딜·특가를 실시간으로 한곳에 모은 핫딜 사이트예요. 진짜 싼지 근거를 붙이고, 원하는 상품이 올라오면 iOS·Android 앱으로 바로 알려주는 무료 핫딜 알림 서비스예요.`;
const title = homeTitle;
const description = homeDescription;
const applicationName = '지름알림';
const siteName = '지름알림';
const locale = 'ko_KR';
const defaultCategory = '쇼핑/핫딜';
const defaultClassification = '쇼핑 핫딜 정보 플랫폼';
const contactEmail = 'jirumalarm@gmail.com';
const ogImageUrl = `${METADATA_SERVICE_URL}/opengraph-image.webp`;
const iconUrl = `${METADATA_SERVICE_URL}/icon.png`;
const appleTouchIconUrl = `${METADATA_SERVICE_URL}/apple-touch-icon.png`;
const faviconUrl = `${METADATA_SERVICE_URL}/favicon.ico`;
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
  // 512px icon.png(121KB) 는 파비콘으로 쓰지 않는다(매 페이지 내려갔다). icon.png 는 JSON-LD 로고 전용.
  // 파비콘은 절대경로로 — 네이버 가이드(markup-favicon)는 상대경로·같은 rel 중복을 반영 안 될 수 있다고
  // 명시한다. 그래서 favicon.ico 를 app/ 자동 링크(상대경로 `/favicon.ico?해시`)에서 public/ 으로 옮겼다.
  icons: {
    icon: [{ url: faviconUrl, sizes: '48x48', type: 'image/x-icon' }],
    apple: [{ url: appleTouchIconUrl }],
  },
  // alternates(canonical) 는 여기 두지 않는다 — 두면 자기 canonical 이 없는 noindex 페이지(/search·/app·글쓰기·404 등)가
  // 홈을 정본으로 물려받아 «noindex + 홈 canonical» 모순 신호가 된다(2026-10-22). 색인 페이지는 전부 자기 canonical 을 쓴다(홈 포함).
  // RSS 링크도 여기 두지 않는다 — 라우트가 alternates 를 덮으면 같이 날아감(shallow merge).
  // app/layout.tsx 의 <link rel="alternate"> 가 정본.
  robots: robotsDirective,
  other: {
    'platform:name': siteName,
    'platform:contact': contactEmail,
    // iOS 사파리 네이티브 Smart App Banner. 미설치=받기 / 설치=열기 를 OS 가 알아서 처리.
    // ponytail: 메타 한 줄. 커스텀 배너 컴포넌트 불필요. 사파리 전용(카톡 인앱·안드로이드는 안 뜸).
    'apple-itunes-app': 'app-id=6474611420',
  },
};

// 서비스 이름의 영문 표기 — llms.txt 첫 줄 「지름알림 (Jirum Alarm)」과 같게.
const alternateName = 'Jirum Alarm';
// 운영 주체·웹사이트는 레이아웃이 모든 페이지에 한 번 선언하고 다른 블록은 이 @id 로 가리킨다 — 블록마다 이름·URL 로
// 새로 선언하면 검색엔진·AI 가 같은 실체를 여러 개로 읽는다. 상품 ItemPage.isPartOf 가 같은 값을 쓴다(product-structured-data.ts),
// 어긋나면 scripts/seo-check.py 가 «@id 참조가 페이지에 없음»으로 잡는다.
const ORGANIZATION_LD_ID = `${METADATA_SERVICE_URL}/#organization`;
const WEBSITE_LD_ID = `${METADATA_SERVICE_URL}/#website`;

export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_LD_ID,
  name: siteName,
  alternateName,
  description,
  url: METADATA_SERVICE_URL,
  // 구글은 사이트링크 검색창을 2024-11 에 종료했다. 남겨둔 이유 = 네이버·AI 크롤러가
  // 사이트 내 검색 진입점으로 읽을 여지가 있고, 틀린 정보가 아니라서 해가 없음.
  // ponytail: 삭제해도 손해 없고 남겨도 손해 없다 → 건드리지 않는다.
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
  publisher: { '@id': ORGANIZATION_LD_ID },
};

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': ORGANIZATION_LD_ID,
  name: siteName,
  alternateName,
  url: METADATA_SERVICE_URL,
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
  sameAs: [
    'https://apps.apple.com/kr/app/id6474611420',
    'https://play.google.com/store/apps/details?id=com.solcode.jirmalam',
    'https://www.instagram.com/jirumalarm_',
    // 공개 GitHub 조직 — 이름 「지름알림」·블로그 주소가 이 사이트라 양쪽에서 같은 실체임을 확인할 수 있다.
    'https://github.com/jirum-alarm',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'KR',
  },
};
