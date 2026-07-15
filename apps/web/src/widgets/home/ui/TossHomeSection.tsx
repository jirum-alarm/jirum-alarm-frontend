'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { TOSS_SECTIONS } from '@/app/(desktop-ready)/toss/mock';
import { fetchTossDeals } from '@/app/(desktop-ready)/toss/toss.api';
import TossDealCard from '@/app/(desktop-ready)/toss/TossDealCard';

import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';
import SectionHeader from '@/shared/ui/SectionHeader';

import PromotionTabs from './PromotionTabs';

// 홈의 토스 특가 섹션. "쇼핑몰별 모아보기"(GRID_TABBED)와 동일 구조 —
// 헤더 + 탭 pill(7섹션) + 그리드. 딜은 서버 실 조회. 탭별 대표 6개 + 더보기(/toss?tab=id).
export default function TossHomeSection() {
  const tabs = TOSS_SECTIONS.map((s) => ({ id: s.id, label: s.label, variables: {} }));
  const [activeId, setActiveId] = useState(tabs[0].id);

  const { data: deals = [], isFetched } = useQuery({
    queryKey: ['toss-home-deals', activeId],
    queryFn: () => fetchTossDeals({ section: activeId, limit: 6 }),
    // 탭 전환 시 이전 데이터 유지 → 섹션이 사라졌다 뜨는 깜빡임 방지.
    placeholderData: (prev) => prev,
  });

  // 최초 로드에서 딜이 아예 없으면 섹션 숨김(게스트 추천 정책). 탭 전환 중엔 유지.
  if (isFetched && deals.length === 0) return null;

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
        <PromotionTabs tabs={tabs} activeTabId={activeId} onTabClick={(t) => setActiveId(t.id)} />
      </div>
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
