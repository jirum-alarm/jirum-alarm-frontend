import { Metadata } from 'next';
import { Suspense } from 'react';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { SiwolPromotionLanding } from '@/widgets/promotion/2607siwol/ui/SiwolPromotionLanding';

const title = '프로 절약러를 위한 0원 이벤트 | 지름알림';
const description =
  '지름알림 단독 이벤트 코드로 알뜰폰 0원 이벤트에 참여해보세요. 시크릿 코드를 복사하고 입장하기 버튼으로 바로 이동할 수 있습니다.';
const url = `${METADATA_SERVICE_URL}/promotion/2607siwol`;
const image = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    siteName: '지름알림',
    locale: 'ko_KR',
    type: 'website',
    images: [{ url: image, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: image,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: '프로 절약러를 위한 0원 이벤트',
  description,
  startDate: '2026-07-01',
  endDate: '2026-08-01',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  eventStatus: 'https://schema.org/EventScheduled',
  url,
  image: [image],
  organizer: {
    '@type': 'Organization',
    name: '지름알림',
    url: METADATA_SERVICE_URL,
  },
  offers: {
    '@type': 'Offer',
    name: '지름알림 시크릿 코드',
    price: '0',
    priceCurrency: 'KRW',
    availability: 'https://schema.org/InStock',
    validFrom: '2026-07-01',
    url,
  },
};

export default function SiwolPromotionPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Suspense>
        <SiwolPromotionLanding />
      </Suspense>
    </>
  );
}
