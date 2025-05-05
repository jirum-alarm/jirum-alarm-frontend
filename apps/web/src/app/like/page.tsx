import { Suspense } from 'react';

import { IllustStandingSmall } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';

import ProductLikeContainerServer from './components/ProductLikeContainerServer';

const LikePage = () => {
  return (
    <BasicLayout hasBackButton title="찜 목록">
      <div className="flex h-full flex-col px-5 pb-9 pt-3">
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
      <div className="grid animate-pulse grid-cols-2 justify-items-center gap-x-3 gap-y-5 smd:grid-cols-3">
        {Array.from({ length: 12 }).map((item, i) => (
          <div key={i} className="w-full">
            <div className="flex aspect-square items-center justify-center rounded-lg bg-gray-100">
              <IllustStandingSmall />
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
