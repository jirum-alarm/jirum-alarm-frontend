import { Suspense } from 'react';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendedProductTabsFetcher from './RecommendedProductTabsFetcher';

const RecommendedProductContainer = () => {
  return (
    <div className="px-4">
      <div className="flex items-center justify-between pb-5 pt-2">
        <h2 className="text-lg font-bold text-gray-900">지름알림 추천</h2>
        <RecommendedMoreLink>더보기</RecommendedMoreLink>
      </div>
      <div className="pb-[52px]">
        <Suspense>
          <RecommendedProductTabsFetcher>
            <RecommendedProductList />
          </RecommendedProductTabsFetcher>
        </Suspense>
      </div>
    </div>
  );
};

export default RecommendedProductContainer;
