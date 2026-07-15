'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import PromotionTabs from '@/widgets/home/ui/PromotionTabs';

import { TOSS_SECTIONS } from './mock';
import { fetchTossCategoryLabels, fetchTossDeals } from './toss.api';
import TossCategoryTabs from './TossCategoryTabs';
import TossDealCard from './TossDealCard';

const CATEGORY_SECTION_ID = 'category';

// 토스 특가 상세. 탭 라벨은 고정(7섹션), 딜은 서버 실 조회.
// '카테고리 인기' 탭은 2단 — 하위 카테고리(동적 categoryLabel) 탭이 섹션탭과 그리드 중간에 뜬다.
export default function TossDailyContainer() {
  const router = useRouter();
  const params = useSearchParams();

  const tabs = TOSS_SECTIONS.map((s) => ({ id: s.id, label: s.label, variables: {} }));
  const tabParam = params.get('tab');
  const active = TOSS_SECTIONS.find((s) => s.id === tabParam) ?? TOSS_SECTIONS[0];
  const isCategory = active.id === CATEGORY_SECTION_ID;
  const catParam = params.get('cat') ?? undefined;

  // 카테고리 탭일 때만 하위 라벨 조회(첫 라벨 기본값 계산용).
  const { data: categoryLabels = [] } = useQuery({
    queryKey: ['toss-category-labels'],
    queryFn: fetchTossCategoryLabels,
    enabled: isCategory,
  });
  const activeCat = isCategory ? (catParam ?? categoryLabels[0]) : undefined;

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['toss-deals', active.id, activeCat ?? null],
    queryFn: () => fetchTossDeals({ section: active.id, categoryLabel: activeCat, limit: 20 }),
    enabled: !isCategory || !!activeCat,
  });

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    if (key === 'tab') next.delete('cat'); // 섹션 바꾸면 하위 카테고리 초기화
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="pc:justify-center sticky top-14 z-40 flex w-full bg-white py-2">
        <PromotionTabs
          tabs={tabs}
          activeTabId={active.id}
          onTabClick={(t) => setParam('tab', t.id)}
        />
      </div>

      {isCategory && (
        <TossCategoryTabs activeLabel={activeCat} onSelect={(l) => setParam('cat', l)} />
      )}

      <div className="pc:pt-7 px-5 py-14">
        {!isLoading && deals.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">아직 준비된 특가가 없어요.</p>
        ) : (
          <div className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3">
            {deals.map((deal, i) => (
              <TossDealCard key={deal.id} deal={deal} priority={i < 5} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
