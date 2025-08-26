import { Metadata } from 'next';
import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';

import TrendingContainerServer from './components/trending-container/server';
import TrendingPageHeader from './components/TrendingPageHeader';
import { TAB_META } from './tabMeta';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}): Promise<Metadata> {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;
  const meta = TAB_META[tabNumber] || TAB_META[0];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://jirum-alarm.com/trending?tab=${tabNumber}`,
      images: ['/assets/images/opengraph-image.png'],
      type: 'website',
      siteName: '지름알림',
    },
  };
}

const TrendingPage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return <TrendingContainerServer tab={tabNumber} />;
};

export default TrendingPage;
