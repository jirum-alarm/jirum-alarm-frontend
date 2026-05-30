import { Metadata } from 'next';
import { Suspense } from 'react';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import AddFCMToken from '@/features/alarm/ui/AddFCMToken';

import HomeContainerV2 from '@/widgets/home/ui/HomeContainerV2';
// import { getFeatureFlag } from '../actions/posthog';

const homeTitle = '지름알림: 실시간 초특가 핫딜 정보 모아보기 | 지금 놓치면 끝!';
const homeDescription =
  '전자제품부터 패션까지 초특가 할인 정보를 실시간으로 만나보세요. 모두가 알뜰하게 쇼핑하는 그날까지🔥';
const homeOgImage = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

export const metadata: Metadata = {
  alternates: {
    canonical: METADATA_SERVICE_URL,
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: METADATA_SERVICE_URL,
    siteName: '지름알림',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: homeOgImage,
        width: 1200,
        height: 630,
        alt: homeTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: homeTitle,
    description: homeDescription,
    images: homeOgImage,
  },
};

export default async function Home() {
  // const { flags } = await getFeatureFlag();

  return (
    <>
      <Suspense>
        <AddFCMToken />
      </Suspense>
      <HomeContainerV2 />
    </>
  );
}
