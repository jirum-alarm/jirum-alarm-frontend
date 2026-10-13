import { rankingVariables } from '@/shared/api/products';
import { fetchProductList } from '@/shared/api/server';
import { BEAUTY_CATEGORY_ID, BEAUTY_ROUTE, SERVICE_NAME } from '@/shared/config/beauty';
import { serviceUrl } from '@/shared/config/env';
import { beautyUrl, itemListJsonLd, jsonLdHtml } from '@/shared/lib/seo';
import BeautyFooter from '@/widgets/BeautyFooter';
import BeautyHeader from '@/widgets/BeautyHeader';
import RankingInfiniteList from '@/widgets/RankingInfiniteList';

import type { Metadata } from 'next';

const TITLE = `뷰티 핫딜 랭킹 | ${SERVICE_NAME}`;
const DESCRIPTION = '지금 커뮤니티 반응이 가장 뜨거운 화장품·스킨케어 핫딜 순위예요.';

/** 서버가 HTML 에 심는 첫 쪽 크기 — 나머지는 스크롤하면 이어 받는다. */
const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const url = beautyUrl(serviceUrl(), BEAUTY_ROUTE.RANKING);
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: url },
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      url,
      type: 'website',
      siteName: '지름알림',
      locale: 'ko_KR',
      images: [{ url: `${serviceUrl()}/opengraph-image.webp`, width: 1200, height: 630 }],
    },
  };
}

/** 뷰티 랭킹 — 커뮤니티 반응 순(진행 중·최근 60일). 첫 20개는 서버, 이어지는 쪽은 브라우저가 searchAfter 로. */
export default async function BeautyRankingPage() {
  const base = serviceUrl();
  const variables = rankingVariables(BEAUTY_CATEGORY_ID, PAGE_SIZE);
  const initial = await fetchProductList(variables);
  const itemList = itemListJsonLd(base, '뷰티 핫딜 랭킹', initial);

  return (
    <>
      <BeautyHeader back title="뷰티 랭킹" />
      {itemList && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(itemList)} />
      )}
      <main className="px-5 pt-14 pb-6">
        <h1 className="sr-only">뷰티 핫딜 랭킹</h1>
        <p className="py-4 text-sm text-gray-600">{DESCRIPTION}</p>
        <RankingInfiniteList initial={initial} variables={variables} />
      </main>
      <BeautyFooter />
    </>
  );
}
