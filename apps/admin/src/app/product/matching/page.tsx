'use client';

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import useIsLoggedIn from '@/hooks/useIsLoggedIn';

import VerificationGroupByView from './components/VerificationGroupByView';

const ProductMatchingPage = () => {
  const isLoggedIn = useIsLoggedIn();

  return (
    <DefaultLayout isLoggedIn={isLoggedIn}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white">상품 매칭</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            다나와 상품을 기준으로 유사한 커뮤니티 게시물을 매칭하고 검증합니다.
          </p>
        </div>
        <div className="text-gray-400 flex items-center gap-3 text-xs">
          <div className="bg-gray-100 flex items-center gap-2 rounded-lg px-3 py-2 dark:bg-meta-4">
            <span className="font-semibold text-black dark:text-white">단축키 가이드</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <kbd className="font-mono rounded bg-white px-1.5 py-1 text-[10px] shadow-sm dark:bg-boxdark">
              ↑↓
            </kbd>
            <span>상품 이동</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <kbd className="font-mono rounded bg-white px-1.5 py-1 text-[10px] shadow-sm dark:bg-boxdark">
              →
            </kbd>
            <span>게시물로</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <kbd className="font-mono rounded bg-white px-1.5 py-1 text-[10px] shadow-sm dark:bg-boxdark">
              Space
            </kbd>
            <span>선택</span>
          </div>
          <div className="hidden items-center gap-1.5 sm:flex">
            <kbd className="font-mono rounded bg-white px-1.5 py-1 text-[10px] shadow-sm dark:bg-boxdark">
              Enter
            </kbd>
            <span>확정</span>
          </div>
        </div>
      </div>

      <VerificationGroupByView />
    </DefaultLayout>
  );
};

export default ProductMatchingPage;
