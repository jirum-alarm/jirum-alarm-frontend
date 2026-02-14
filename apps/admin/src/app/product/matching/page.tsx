'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useIsLoggedIn from '@/hooks/useIsLoggedIn';

import VerificationGroupByView from './components/VerificationGroupByView';

const ProductMatchingPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return (
    <DefaultLayout isLoggedIn={isLoggedIn}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black dark:text-white">상품 매칭</h2>
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
            Ctrl+Enter
          </kbd>
          <span>확정+다음</span>
        </div>
      </div>

      <VerificationGroupByView />
    </DefaultLayout>
  );
};

export default ProductMatchingPage;
