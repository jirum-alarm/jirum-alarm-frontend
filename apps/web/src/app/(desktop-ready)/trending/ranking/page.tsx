import { Metadata } from 'next';

import { TAB_META } from '@/widgets/trending/lib/tabMeta';
import TrendingContainerServer from '@/widgets/trending/ui/trending-container/server';

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
      url: `https://jirum-alarm.com/trending/ranking?tab=${tabNumber}`,
      images: ['/assets/images/opengraph-image.webp'],
      type: 'website',
      siteName: '지름알림',
    },
  };
}

const RankingPage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return <TrendingContainerServer tab={tabNumber} />;
};

export default RankingPage;
