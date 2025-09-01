import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';

import RecommendedMoreLink from './RecommendedMoreLink';
import RecommendedProductList from './RecommendedProductList';
import RecommendPrefetch from './RecommendPrefetch';

const RecommendedProductSection = () => {
  return (
    <section>
      <div className="pc:px-0 px-5">
        <SectionHeader
          title="지름알림 추천"
          right={
            <div className="-mx-2 flex items-center px-2 py-3">
              <RecommendedMoreLink>더보기</RecommendedMoreLink>
            </div>
          }
        />
      </div>
      <div className="pc:pt-4 pc:overflow-x-hidden pb-5">
        <RecommendPrefetch>
          <Suspense>
            <RecommendedProductList />
          </Suspense>
        </RecommendPrefetch>
      </div>
    </section>
  );
};

export default RecommendedProductSection;
