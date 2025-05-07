import { Suspense } from 'react';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import SectionHeader from '@/components/SectionHeader';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendedProductTabsFetcher from './RecommendedProductTabsFetcher';

const RecommendedProductContainer = () => {
  return (
    <div className="px-5">
      <SectionHeader
        title="지름알림 추천"
        right={<RecommendedMoreLink>더보기</RecommendedMoreLink>}
      />
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
