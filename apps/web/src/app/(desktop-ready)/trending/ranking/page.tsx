import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { TAB_META } from '@/widgets/trending';
import { TrendingContainerServer } from '@/widgets/trending';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}): Promise<Metadata> {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;
  const meta = TAB_META[tabNumber] || TAB_META[0];
  const url = `${METADATA_SERVICE_URL}/trending/ranking?tab=${tabNumber}`;
  const image = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      images: [image],
      type: 'website',
      siteName: '지름알림',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: image,
    },
    alternates: {
      canonical: url,
    },
  };
}

const RankingPage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;

  return <TrendingContainerServer tab={tabNumber} />;
};

export default RankingPage;
