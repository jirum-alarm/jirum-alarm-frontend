import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import SmallIllust from '@/shared/ui/common/icons/Illust/SmallIllust';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import ProductLikeContainerServer from './components/ProductLikeContainerServer';

const LikePage = async () => {
  const { isMobile } = await checkDevice();

  // PC 는 /themes·/recommend 와 같은 틀: SectionHeader 중앙 타이틀 + max-w-layout-max(그리드가 pc:5열).
  if (!isMobile) {
    return (
      <div className="mt-14 pt-8">
        <h1 className="sr-only">찜 목록</h1>
        <SectionHeader title="찜 목록" />
        <div className="max-w-layout-max mx-auto px-5 pb-16">
          <Suspense fallback={<ProductLikeSkeleton />}>
            <ProductLikeContainerServer />
          </Suspense>
        </div>
      </div>
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
      <div className="pc:grid-cols-5 pc:gap-x-[25px] pc:gap-y-10 grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3">
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
