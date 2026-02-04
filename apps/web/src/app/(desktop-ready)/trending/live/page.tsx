import { Metadata } from 'next';

import LiveContainerServer from '@/widgets/trending/ui/live-container/server';

export const metadata: Metadata = {
  title: '실시간 핫딜 | 지름알림',
  description: '지금 가장 핫한 실시간 핫딜을 확인하세요.',
  openGraph: {
    title: '실시간 핫딜 | 지름알림',
    description: '지금 가장 핫한 실시간 핫딜을 확인하세요.',
    url: 'https://jirum-alarm.com/trending/live',
    images: ['/assets/images/opengraph-image.webp'],
    type: 'website',
    siteName: '지름알림',
  },
};

const LivePage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return <LiveContainerServer tab={tabNumber} />;
};

export default LivePage;
