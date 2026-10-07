'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import FlaggedQueueView from './components/FlaggedQueueView';
import GatedMappingList from './components/GatedMappingList';
import VerificationGroupByView from './components/VerificationGroupByView';
import VerificationHistory from './components/VerificationHistory';

// 매칭 관련 검수 큐를 한 화면 탭으로 — 게이트 차단은 예전엔 별도 메뉴(/product/matching-gated)였다.
// 탭은 URL(?tab=)에 둔다: 뒤로 가기·새로고침·링크로 같은 탭이 열리게.
const TABS = [
  { key: 'brand', label: '브랜드별' },
  { key: 'flagged', label: '🤖 거절추천' },
  { key: 'gated', label: '게이트 차단' },
  { key: 'history', label: '매칭 결과' },
] as const;
type ViewMode = (typeof TABS)[number]['key'];

const ProductMatching = () => {
  const router = useRouter();
  const pathname = usePathname();
  const tab = useSearchParams().get('tab');
  const viewMode: ViewMode = TABS.some((t) => t.key === tab) ? (tab as ViewMode) : 'brand';
  const setViewMode = (key: ViewMode) =>
    router.replace(key === 'brand' ? pathname : `${pathname}?tab=${key}`, { scroll: false });

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <h2 className="text-xl font-bold text-black dark:text-white">상품 매칭</h2>

          {/* 뷰 전환 탭 */}
          <div className="flex overflow-x-auto rounded-lg border border-stroke bg-white p-0.5 dark:border-strokedark dark:bg-boxdark">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setViewMode(t.key)}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-xs font-medium transition-colors sm:py-1.5 ${
                  viewMode === t.key
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 브랜드별 뷰 단축키 힌트 */}
        {viewMode === 'brand' && (
          <div className="hidden items-center gap-2 text-[11px] text-gray-400 lg:flex">
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
              ↑↓
            </kbd>
            <span>이동</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
              →←
            </kbd>
            <span>패널전환</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
              Space
            </kbd>
            <span>선택</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
              Enter
            </kbd>
            <span>확정</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
              ⌘/Ctrl+Z
            </kbd>
            <span>되돌리기</span>
            <kbd className="rounded bg-white px-1.5 py-0.5 font-mono shadow-sm dark:bg-boxdark">
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

// useSearchParams 는 Suspense 안에서만 정적 빌드가 된다
const ProductMatchingPage = () => (
  <Suspense>
    <ProductMatching />
  </Suspense>
);

export default ProductMatchingPage;
