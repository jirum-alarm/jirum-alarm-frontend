import { Metadata } from 'next';
import { Suspense } from 'react';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { TOSS_SECTIONS } from './mock';
import { fetchTossDeals } from './toss.api';
import TossDailyContainer from './TossDailyContainer';

export const metadata: Metadata = {
  title: '토스 하루특가 | 지름알림',
  description: '오늘만 이 가격, 토스 하루특가를 지름알림에서 한눈에.',
  alternates: { canonical: '/toss' }, // ?tab=/?cat= 파라미터 조합이 중복 인덱싱되지 않게 대표 URL 고정
  openGraph: {
    title: '토스 하루특가 | 지름알림',
    description: '오늘만 이 가격, 토스 하루특가를 지름알림에서 한눈에.',
    url: '/toss',
    // 라우트가 openGraph 를 지정하면 루트 images 가 같이 날아간다 → 공유 썸네일이 빈다.
    images: [{ url: `${METADATA_SERVICE_URL}/opengraph-image.webp`, width: 1200, height: 630 }],
  },
};

export const revalidate = 600; // 10분 ISR — /deals 와 동일(목록은 자주 안 바뀜)

// 기본 탭(첫 섹션) 딜을 서버에서 프리페치해 초기 HTML에 심는다(크롤러가 본문·링크를 보게).
// public:true → cookies() 스킵 → 라우트 ISR 캐시 허용. 탭/카테고리 전환은 클라 useQuery 그대로.
export default async function TossDailyPage() {
  const initialSection = TOSS_SECTIONS[0];
  const initialDeals = await fetchTossDeals({
    section: initialSection.id,
    limit: 20,
    public: true,
    revalidate: 600,
  });

  const itemListLd =
    initialDeals.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: '토스 하루특가',
          itemListElement: initialDeals.map((d, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: d.title,
            url: d.productId ? `${METADATA_SERVICE_URL}/products/${d.productId}` : undefined,
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
      {/* 페이지 주제를 h1 으로 한 번 선언한다. 본문은 탭부터 시작해 h1 이 없었음(2026-09-02 실측).
          themes/page.tsx 와 같은 sr-only 관행 — 화면 레이아웃은 그대로 두고 문서 구조만 채운다. */}
      <h1 className="sr-only">토스 하루특가</h1>
      {/* useSearchParams 는 Suspense 경계 필요(App Router). */}
      <Suspense>
        <TossDailyContainer initialSectionId={initialSection.id} initialDeals={initialDeals} />
      </Suspense>
    </>
  );
}
