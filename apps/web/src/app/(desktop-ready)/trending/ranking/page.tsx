import { Metadata } from 'next';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { TAB_META } from '@/widgets/trending/lib/tabMeta';
import TrendingContainerServer from '@/widgets/trending/ui/trending-container/server';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}): Promise<Metadata> {
  const { tab } = await searchParams;
  const requested = tab ? Number(tab) : 0;
  // 없는 탭(12 이상·숫자 아님)은 "전체 랭킹"(tab=0) 화면이 그대로 나온다 — canonical 도 tab=0 으로 모아
  // 같은 내용의 URL 이 따로 색인되지 않게 한다(2026-10-01 실측: tab=12 가 자기 canonical 로 200).
  const tabNumber = TAB_META[requested] ? requested : 0;
  const meta = TAB_META[tabNumber];
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
