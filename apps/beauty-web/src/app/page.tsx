import { emptyText } from '@jirum/design-system/recipes';

import { fetchBeautyLatest, fetchBeautyRanking, fetchTossBeauty } from '@/shared/api/server';
import { BEAUTY_ROUTE, CARD_SOURCE, SERVICE_NAME } from '@/shared/config/beauty';
import { kakaoBeautyRoomUrl, serviceUrl } from '@/shared/config/env';
import { cn } from '@/shared/lib/cn';
import { beautyUrl, itemListJsonLd, jsonLdHtml } from '@/shared/lib/seo';
import BeautyFooter from '@/widgets/BeautyFooter';
import BeautyHeader from '@/widgets/BeautyHeader';
import BeautyKakaoCta from '@/widgets/BeautyKakaoCta';
import ProductCard, { ProductGrid } from '@/widgets/ProductCard';
import SectionHeader from '@/widgets/SectionHeader';
import TossDealCard from '@/widgets/TossDealCard';

import type { Metadata } from 'next';

const TITLE = `뷰티 핫딜 | ${SERVICE_NAME}`;
const DESCRIPTION = '화장품·스킨케어 특가를 커뮤니티 반응 순으로 모았어요.';

/** 홈 섹션 크기 — 랭킹은 맛보기(2열 3줄)·더보기로 /beauty/ranking, 최신은 2열 5줄. */
const RANKING_PREVIEW = 6;
const TOSS_COUNT = 10;
const LATEST_COUNT = 10;

export async function generateMetadata(): Promise<Metadata> {
  const url = beautyUrl(serviceUrl());
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

/**
 * 지름알림 뷰티 홈. 모든 섹션이 화장품(categoryId 3) 고정 — 카테고리 탭·관심 카테고리 없음.
 * 섹션마다 서버에서 받아 초기 HTML 에 심는다(크롤러가 본문·링크를 보게). 한 섹션이 실패하면 그 섹션만 빈다.
 * 노출 위치(data-position)는 홈 전체에서 문서 순서로 잇는다: 랭킹 0~ → 토스 → 최신(web 홈 프로모션과 같은 방식).
 */
export default async function BeautyHomePage() {
  const base = serviceUrl();
  const [ranking, toss, latest] = await Promise.all([
    fetchBeautyRanking(RANKING_PREVIEW),
    fetchTossBeauty(TOSS_COUNT),
    fetchBeautyLatest(LATEST_COUNT),
  ]);
  const kakaoUrl = kakaoBeautyRoomUrl();

  const tossFrom = ranking.length;
  const latestFrom = tossFrom + toss.length;

  const itemList = itemListJsonLd(base, '지금 반응 오는 뷰티 핫딜', ranking);

  return (
    <>
      <BeautyHeader />
      {itemList && (
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(itemList)} />
      )}
      <main className="px-5 pt-14 pb-6">
        <h1 className="sr-only">뷰티 핫딜</h1>
        <p className="pt-4 text-sm text-gray-600">{DESCRIPTION}</p>
        <BeautyKakaoCta href={kakaoUrl} className="mt-4" />

        <section aria-label="지금 반응 오는 뷰티 핫딜" className="mt-4">
          <SectionHeader
            title="지금 반응 오는 뷰티 핫딜"
            subtitle="커뮤니티 추천·댓글이 몰리는 순서"
            moreHref={BEAUTY_ROUTE.RANKING}
            moreLabel="랭킹 더보기"
          />
          {ranking.length > 0 ? (
            <ProductGrid>
              {ranking.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  showTime={false}
                  tracking={{
                    source: CARD_SOURCE.HOME,
                    position: index,
                    rank: index + 1,
                    section: 'ranking',
                  }}
                />
              ))}
            </ProductGrid>
          ) : (
            <p className={cn('py-10 text-center', emptyText)}>지금 진행 중인 뷰티 핫딜이 없어요.</p>
          )}
        </section>

        {/* 토스 카테고리 인기의 「뷰티」 — 비어 있으면 섹션째 숨긴다(토스 피드가 끊긴 날). */}
        {toss.length > 0 && (
          <section aria-label="토스 뷰티 인기 상품" className="mt-8">
            <SectionHeader title="토스에서 많이 사는 뷰티" subtitle="토스쇼핑 뷰티 카테고리 인기" />
            <ul className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
              {toss.map((deal, index) => (
                <li key={deal.id} className="w-35 shrink-0">
                  <TossDealCard
                    deal={deal}
                    tracking={{
                      source: CARD_SOURCE.HOME,
                      position: tossFrom + index,
                      section: 'toss',
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-label="방금 올라온 뷰티 딜" className="mt-8">
          <SectionHeader title="방금 올라온 뷰티 딜" subtitle="커뮤니티에 새로 올라온 순서" />
          {latest.length > 0 ? (
            <ProductGrid>
              {latest.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  tracking={{
                    source: CARD_SOURCE.HOME,
                    position: latestFrom + index,
                    section: 'latest',
                  }}
                />
              ))}
            </ProductGrid>
          ) : (
            <p className={cn('py-10 text-center', emptyText)}>새로 올라온 뷰티 딜이 없어요.</p>
          )}
        </section>
      </main>
      <BeautyFooter />
    </>
  );
}
