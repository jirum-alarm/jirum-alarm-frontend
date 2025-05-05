import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendedProductTabsFetcher from './RecommendedProductTabsFetcher';

const RecommendedProductContainer = () => {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between py-3">
        <h2 className="text-lg font-bold text-gray-900">지름알림 추천</h2>
        <RecommendedMoreLink>더보기</RecommendedMoreLink>
      </div>
      <div className="pb-5">
        <ApiErrorBoundary>
          <Suspense>
            <RecommendedProductTabsFetcher>
              <RecommendedProductList />
            </RecommendedProductTabsFetcher>
          </Suspense>
        </ApiErrorBoundary>
      </div>
    </div>
  );
};

export default RecommendedProductContainer;
