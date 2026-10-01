import { Metadata } from 'next';
import Link from 'next/link';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { KEYWORD_HUBS, keywordHubPath } from '@/entities/keyword-hub/lib/keyword-hub';

import DealsMobileHeader from '../deals/[slug]/DealsMobileHeader';

const title = '키워드별 핫딜 모음 | 지름알림';
const description = `삼다수·햇반·기저귀·노트북 등 ${KEYWORD_HUBS.length}개 키워드로 커뮤니티 핫딜을 모았어요. 키워드를 누르면 최근 30일 핫딜을 볼 수 있어요.`;

export const metadata: Metadata = {
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

export default function KeywordHubIndexPage() {
  return (
    <main className="max-w-mobile-max pc:max-w-layout-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <DealsMobileHeader title="키워드별 핫딜" />
      <h1 className="mb-2 text-2xl font-bold text-black">키워드별 핫딜 모음</h1>
      <p className="mb-6 text-sm text-gray-600">{description}</p>
      <ul className="flex flex-wrap gap-2">
        {KEYWORD_HUBS.map((h) => (
          <li key={h.slug}>
            <Link
              href={keywordHubPath(h)}
              className="inline-block rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-800 hover:bg-gray-50"
            >
              {h.name} 핫딜
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
