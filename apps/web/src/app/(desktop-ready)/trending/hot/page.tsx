import { HOT_FEED_COPY } from '@jirum/domain/ranking';
import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import LiveContainerServer from '@/widgets/trending/ui/live-container/server';

const hotTitle = '실시간 핫딜만 | 지름알림';
const hotDescription = `${HOT_FEED_COPY.lead}. 커뮤니티 인기글과 평소보다 확실히 싼 딜만 최신순으로 확인하세요.`;
const hotUrl = `${METADATA_SERVICE_URL}/trending/hot`;
const hotOgImage = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

export const metadata: Metadata = {
  title: hotTitle,
  description: hotDescription,
  openGraph: {
    title: hotTitle,
    description: hotDescription,
    url: hotUrl,
    images: [{ url: hotOgImage, width: 1200, height: 630, alt: hotTitle }],
    type: 'website',
    siteName: '지름알림',
    locale: 'ko_KR',
  },
  twitter: {
    card: 'summary_large_image',
    title: hotTitle,
    description: hotDescription,
    images: hotOgImage,
  },
  alternates: {
    canonical: hotUrl,
  },
};

const HotPage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return (
    <>
      <h1 className="sr-only">실시간 핫딜만 · 커뮤니티 인기 핫딜</h1>
      <LiveContainerServer tab={tabNumber} feed="hot" />
    </>
  );
};

export default HotPage;
