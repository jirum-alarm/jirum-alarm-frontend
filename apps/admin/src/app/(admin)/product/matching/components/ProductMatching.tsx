'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import SegmentedControl from '@/components/SegmentedControl';

import FlaggedQueueView from './FlaggedQueueView';
import GatedMappingList from './GatedMappingList';
import VerificationGroupByView from './VerificationGroupByView';
import VerificationHistory from './VerificationHistory';

// 매칭 관련 검수 큐를 한 화면 탭으로 — 게이트 차단은 예전엔 별도 메뉴(/product/matching-gated)였다.
// 탭은 URL(?tab=)에 둔다: 뒤로 가기·새로고침·링크로 같은 탭이 열리게.
const TABS = [
  { value: 'brand', label: '브랜드별' },
  { value: 'flagged', label: '🤖 거절추천' },
  { value: 'gated', label: '게이트 차단' },
  { value: 'history', label: '매칭 결과' },
] as const;
type ViewMode = (typeof TABS)[number]['value'];

const ProductMatching = () => {
  const router = useRouter();
  const pathname = usePathname();
  const tab = useSearchParams().get('tab');
  const viewMode: ViewMode = TABS.some((t) => t.value === tab) ? (tab as ViewMode) : 'brand';
  const setViewMode = (key: ViewMode) =>
    router.replace(key === 'brand' ? pathname : `${pathname}?tab=${key}`, { scroll: false });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {/* 폰은 상단 헤더에 화면 이름이 이미 있다 */}
          <h2 className="hidden text-xl font-bold text-black lg:block dark:text-white">
            상품 매칭
          </h2>

          <SegmentedControl options={TABS} value={viewMode} onChange={setViewMode} />
        </div>

        {/* 브랜드별 뷰 단축키 힌트 */}
        {viewMode === 'brand' && (
          <div className="hidden items-center gap-2 text-[11px] text-gray-400 lg:flex">
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              ↑↓
            </kbd>
            <span>이동</span>
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              →←
            </kbd>
            <span>패널전환</span>
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              Space
            </kbd>
            <span>선택</span>
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              Enter
            </kbd>
            <span>확정</span>
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              ⌘/Ctrl+Z
            </kbd>
            <span>되돌리기</span>
            <kbd className="rounded-sm bg-white px-1.5 py-0.5 font-mono shadow-xs dark:bg-boxdark">
              ?
            </kbd>
            <span>도움말</span>
          </div>
        )}
      </div>

      {viewMode === 'brand' && <VerificationGroupByView />}
      {viewMode === 'flagged' && <FlaggedQueueView />}
      {viewMode === 'gated' && (
        <>
          <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            추출 오염 / 묶음글 등으로 매칭 전 차단된 항목. 원본 제목과 추출 결과(brand/model)를
            대조해 진짜 오염이면 <b>게이트 맞음</b>, 게이트가 잘못 막았으면 <b>오판 → 재매칭</b>
            (게이트를 끄고 한 번 다시 매칭, 결과는 매칭 검수 대기로)으로 처리하세요.
          </p>
          <GatedMappingList />
        </>
      )}
      {viewMode === 'history' && <VerificationHistory />}
    </>
  );
};

export default ProductMatching;
