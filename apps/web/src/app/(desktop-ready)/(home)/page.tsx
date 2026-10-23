import { Metadata } from 'next';
import { Suspense } from 'react';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { homeDescription, homeTitle } from '@/shared/config/metadata';

import AddFCMToken from '@/features/alarm/ui/AddFCMToken';

import HomeContainerV2 from '@/widgets/home/ui/HomeContainerV2';

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
  return (
    <>
      <Suspense>
        <AddFCMToken />
      </Suspense>
      <HomeContainerV2 />
    </>
  );
}
