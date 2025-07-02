import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeaderHOC';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendedProductTabsFetcher from './RecommendedProductTabsFetcher';

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
        <RecommendedProductTabsFetcher>
          <ApiErrorBoundary>
            <Suspense>
              <RecommendedProductList />
            </Suspense>
          </ApiErrorBoundary>
        </RecommendedProductTabsFetcher>
      </div>
    </div>
  );
};

export default RecommendedProductSection;
