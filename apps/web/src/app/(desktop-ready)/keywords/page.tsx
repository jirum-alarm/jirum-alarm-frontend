import { linkChip } from '@jirum/design-system/recipes';
import { Metadata } from 'next';
import Link from 'next/link';

import { METADATA_SERVICE_URL } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';

import { fetchKeywordHubs } from '@/entities/keyword-hub/api/fetchKeywordHub';
import { formatHubCount, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import DealsMobileHeader from '../deals/[slug]/DealsMobileHeader';

const title = '키워드별 핫딜 모음 | 지름알림';
const buildDescription = (count: number) =>
  `삼다수·햇반·기저귀·노트북 등 ${count}개 키워드로 커뮤니티 핫딜을 모았어요. 키워드를 누르면 최근 30일 핫딜을 볼 수 있어요.`;

export async function generateMetadata(): Promise<Metadata> {
  const description = buildDescription((await fetchKeywordHubs()).length);
  return {
    title,
    description,
    alternates: { canonical: `${METADATA_SERVICE_URL}/keywords` },
    openGraph: {
      title,
      description,
      url: `${METADATA_SERVICE_URL}/keywords`,
      images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
    },
  };
}

export default async function KeywordHubIndexPage() {
  // 30일 딜 많은 순(서버 정렬). 건수를 칩에 붙여 어디가 활발한지 한눈에 보이게 한다.
  const hubs = await fetchKeywordHubs();
  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <DealsMobileHeader title="키워드별 핫딜" />
      <h1 className="mb-2 text-2xl font-bold text-gray-900">키워드별 핫딜 모음</h1>
      <p className="mb-6 text-sm text-gray-600">{buildDescription(hubs.length)}</p>
      <ul className="flex flex-wrap gap-2">
        {hubs.map((h) => (
          <li key={h.slug}>
            <Link href={keywordHubPath(h)} className={cn('inline-block', linkChip)}>
              {h.name} 핫딜
              {h.recentDealCount > 0 && (
                <span className="ml-1 text-gray-500">{formatHubCount(h)}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
