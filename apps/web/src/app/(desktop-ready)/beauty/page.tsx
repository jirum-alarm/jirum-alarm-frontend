import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';
import { Metadata } from 'next';
import { Suspense } from 'react';

import { ProductService } from '@/shared/api/product';
import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { ProductQueries } from '@/entities/product';
import ProductGridListSkeleton from '@/entities/product-list/ui/grid/ProductGridListSkeleton';

import { beautyDealsVariables } from './beauty.query';
import BeautyDealList from './BeautyDealList';
import BeautyOkachatCta from './BeautyOkachatCta';

// 뷰티(화장품) 핫딜 검색 유입 랜딩. 서브도메인이 아니라 경로 — 기존 도메인의 검색 신뢰를 그대로 쓴다.
// 홈·네비 진입점은 일부러 없다(검색 유입만 보는 실험). 앱은 카테고리 탭이 이미 있어 웹 전용.
const TITLE = '뷰티 핫딜 | 지름알림';
const DESCRIPTION = '화장품·스킨케어 특가를 커뮤니티 반응 순으로 모았어요.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/beauty' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: '/beauty',
    // 라우트가 openGraph 를 지정하면 루트 images 가 같이 날아간다 → 공유 썸네일이 빈다.
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

export const revalidate = 600; // 10분 ISR — /toss·/deals 와 동일

// 첫 쪽(20개)을 서버에서 받아 초기 HTML 에 심는다(크롤러가 본문·링크를 보게). 이어지는 쪽은 클라 무한 스크롤.
// public:true → cookies() 스킵(공개 쿼리). 실패하면 빈 캐시로 두고 클라가 다시 받는다.
export default async function BeautyPage() {
  const variables = beautyDealsVariables();
  const queryClient = new QueryClient();
  const firstPage = await ProductService.getProducts(variables, {
    public: true,
    revalidate: 600,
  }).catch(() => null);
  if (firstPage) {
    // BeautyDealList 의 useSuspenseInfiniteQuery 와 같은 키 — 클라는 이 첫 쪽을 그대로 그리고 다음 쪽부터 받는다.
    queryClient.setQueryData(ProductQueries.infiniteRankingProducts(variables).queryKey, {
      pages: [firstPage],
      pageParams: [null],
    });
  }

  const products = firstPage?.products ?? [];
  const itemListLd =
    products.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: '뷰티 핫딜',
          itemListElement: products.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `${METADATA_SERVICE_URL}/products/${p.id}`,
          })),
        }
      : null;

  return (
    <>
      {itemListLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
        />
      )}
      <div className="pc:px-0 px-5 pt-3 pb-10">
        <p className="pc:mb-6 pc:text-center mb-4 text-sm text-gray-600">{DESCRIPTION}</p>
        <BeautyOkachatCta className="pc:mx-auto pc:max-w-xl mb-5" />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <Suspense fallback={<ProductGridListSkeleton length={20} />}>
            <BeautyDealList />
          </Suspense>
        </HydrationBoundary>
      </div>
    </>
  );
}
