import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import SmallIllust from '@/shared/ui/common/icons/Illust/SmallIllust';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import MyPageShell from '@/features/mypage/ui/MyPageShell';

import ProductLikeContainerServer from './components/ProductLikeContainerServer';

const LikePage = async () => {
  const { isMobile } = await checkDevice();

  // PC 는 마이페이지 사이드바(MyPageShell) 오른쪽 — 그리드가 칸을 다 쓰도록 BasicLayout(768px 칸)을 안 쓴다.
  if (!isMobile) {
    return (
      <MyPageShell>
        <div className="px-5 pt-8 pb-16">
          <h1 className="pb-6 text-xl font-bold text-gray-900">찜 목록</h1>
          <Suspense fallback={<ProductLikeSkeleton />}>
            <ProductLikeContainerServer />
          </Suspense>
        </div>
      </MyPageShell>
    );
  }

  return (
    <BasicLayout hasBackButton title="찜 목록">
      <div className="flex h-full flex-col px-5 pt-3 pb-9">
        <Suspense fallback={<ProductLikeSkeleton />}>
          <ProductLikeContainerServer />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default LikePage;

const ProductLikeSkeleton = () => {
  return (
    <div>
      <div className="mb-3 h-[17px] w-1/3 animate-pulse bg-gray-100" />
      <div className="pc:grid-cols-4 pc:gap-x-[25px] pc:gap-y-10 grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
        {Array.from({ length: 12 }).map((item, i) => (
          <div key={i} className="w-full">
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
              <SmallIllust />
            </div>
            <div className="flex flex-col gap-1 pt-2">
              <div className="h-3 bg-gray-100"></div>
              <div className="h-3 w-1/2 bg-gray-100"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
