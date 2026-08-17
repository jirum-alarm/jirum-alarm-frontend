'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { TOSS_SECTIONS, type TossDeal } from '@/app/(desktop-ready)/toss/mock';
import { fetchTossCategoryLabels, fetchTossDeals } from '@/app/(desktop-ready)/toss/toss.api';
import TossCategoryTabs from '@/app/(desktop-ready)/toss/TossCategoryTabs';
import TossDealCard from '@/app/(desktop-ready)/toss/TossDealCard';

import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import PromotionTabs from './PromotionTabs';

const CATEGORY_SECTION_ID = 'category';

// 홈의 토스 특가 섹션. "쇼핑몰별 모아보기"(GRID_TABBED)와 동일 구조.
// 카테고리 인기 탭은 2단 — 하위 카테고리 탭이 섹션탭과 그리드 중간에 뜬다(목록과 공통).
export default function TossHomeSection({ initialDeals }: { initialDeals?: TossDeal[] }) {
  const tabs = TOSS_SECTIONS.map((s) => ({ id: s.id, label: s.label, variables: {} }));
  const [activeId, setActiveId] = useState(tabs[0].id);
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);
  const isCategory = activeId === CATEGORY_SECTION_ID;

  const { data: categoryLabels = [] } = useQuery({
    queryKey: ['toss-category-labels'],
    queryFn: fetchTossCategoryLabels,
    enabled: isCategory,
  });
  const cat = isCategory ? (activeCat ?? categoryLabels[0]) : undefined;

  // 첫 탭은 서버가 채운 initialDeals 로 첫 렌더에 그린다(HTML 에 카드가 박힘).
  // 다른 탭/카테고리는 그대로 클라이언트가 소유.
  const isFirstTab = activeId === tabs[0].id && !isCategory;
  const { data: deals = [], isFetched } = useQuery({
    queryKey: ['toss-home-deals', activeId, cat ?? null],
    queryFn: () => fetchTossDeals({ section: activeId, categoryLabel: cat, limit: 6 }),
    enabled: !isCategory || !!cat,
    placeholderData: (prev) => prev,
    initialData: isFirstTab ? initialDeals : undefined,
  });

  // 서버가 빈 배열을 줬으면 첫 렌더부터 숨긴다(레이아웃 시프트 방지).
  if (isFirstTab && initialDeals?.length === 0) return null;
  if (isFetched && deals.length === 0) return null;

  const selectTab = (id: string) => {
    setActiveId(id);
    setActiveCat(undefined); // 섹션 바꾸면 하위 카테고리 초기화
  };

  return (
    <div className="pc:pt-7 pc:px-0 pc:space-y-0 space-y-2">
      <div className="px-5">
        <SectionHeader
          title="토스 특가"
          right={
            <InteractiveMoreLink
              href={`/toss?tab=${activeId}`}
              className="text-sm text-gray-500 hover:text-gray-700"
              aria-label="토스 특가 더보기"
            >
              더보기
            </InteractiveMoreLink>
          }
        />
      </div>
      <div className="pc:mx-auto w-fit max-w-full">
        <PromotionTabs tabs={tabs} activeTabId={activeId} onTabClick={(t) => selectTab(t.id)} />
      </div>

      {isCategory && <TossCategoryTabs activeLabel={cat} onSelect={setActiveCat} />}

      <div className="pc:py-4 pc:px-0 px-5">
        <div className="pc:grid-cols-6 grid grid-cols-3 gap-x-3 gap-y-5">
          {deals.map((deal, i) => (
            <TossDealCard key={deal.id} deal={deal} priority={i < 3} />
          ))}
        </div>
      </div>
    </div>
  );
}
