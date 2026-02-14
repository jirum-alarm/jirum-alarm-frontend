'use client';

import { useState } from 'react';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useIsLoggedIn from '@/hooks/useIsLoggedIn';

import VerificationGroupByView from './components/VerificationGroupByView';
import VerificationHistory from './components/VerificationHistory';

type ViewMode = 'brand' | 'history';

const ProductMatchingPage = () => {
  const isLoggedIn = useIsLoggedIn();
  const [viewMode, setViewMode] = useState<ViewMode>('brand');

  return (
    <DefaultLayout isLoggedIn={isLoggedIn}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-black dark:text-white">상품 매칭</h2>

          {/* 뷰 전환 탭 */}
          <div className="flex rounded-lg border border-stroke bg-white p-0.5 dark:border-strokedark dark:bg-boxdark">
            <button
              onClick={() => setViewMode('brand')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'brand'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              브랜드별
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'history'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              매칭 결과
            </button>
          </div>
        </div>

        {/* 브랜드별 뷰 단축키 힌트 */}
        {viewMode === 'brand' && (
          <div className="text-gray-400 hidden items-center gap-2 text-[11px] sm:flex">
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              ↑↓
            </kbd>
            <span>이동</span>
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              →←
            </kbd>
            <span>패널전환</span>
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              Space
            </kbd>
            <span>선택</span>
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              Enter
            </kbd>
            <span>확정</span>
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              ⌘/Ctrl+Z
            </kbd>
            <span>되돌리기</span>
            <kbd className="font-mono rounded bg-white px-1.5 py-0.5 shadow-sm dark:bg-boxdark">
              ?
            </kbd>
            <span>도움말</span>
          </div>
        )}
      </div>

      {viewMode === 'brand' && <VerificationGroupByView />}
      {viewMode === 'history' && <VerificationHistory />}
    </DefaultLayout>
  );
};

export default ProductMatchingPage;
