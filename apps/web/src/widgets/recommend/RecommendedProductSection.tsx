import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendPrefetch from './RecommendPrefetch';

const RecommendedProductSection = () => {
  return (
    <div className="px-5">
      <SectionHeader
        title="지름알림 추천"
        right={
          <div className="flex items-center px-2 py-3">
            <RecommendedMoreLink>더보기</RecommendedMoreLink>
          </div>
        }
      />
      <div className="pb-5 pc:pt-4">
        <RecommendPrefetch>
          <ApiErrorBoundary>
            <Suspense>
              <RecommendedProductList />
            </Suspense>
          </ApiErrorBoundary>
        </RecommendPrefetch>
      </div>
    </div>
  );
};

export default RecommendedProductSection;
