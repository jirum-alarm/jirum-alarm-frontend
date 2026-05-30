import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import LiveContainerServer from '@/widgets/trending/ui/live-container/server';

const liveTitle = '실시간 핫딜 | 지름알림';
const liveDescription = '지금 가장 핫한 실시간 핫딜을 확인하세요.';
const liveUrl = `${METADATA_SERVICE_URL}/trending/live`;
const liveOgImage = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

export const metadata: Metadata = {
  title: liveTitle,
  description: liveDescription,
  openGraph: {
    title: liveTitle,
    description: liveDescription,
    url: liveUrl,
    images: [{ url: liveOgImage, width: 1200, height: 630, alt: liveTitle }],
    type: 'website',
    siteName: '지름알림',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: liveTitle,
    description: liveDescription,
    images: liveOgImage,
  },
  alternates: {
    canonical: liveUrl,
  },
};

const LivePage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return <LiveContainerServer tab={tabNumber} />;
};

export default LivePage;
