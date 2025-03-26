import { Suspense } from 'react';

import RecommendedProductTabsFetcher from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabsFetcher';
import RecommendContainer from '@/app/recommend/components/RecommendContainer';
import RecommendPageHeader from '@/app/recommend/components/RecommendPageHeader';
import BasicLayout from '@/components/layout/BasicLayout';

const RecommendPage = () => {
  return (
    <BasicLayout header={<RecommendPageHeader />}>
      <div className="px-[20px] pt-14">
        <Suspense>
          <RecommendedProductTabsFetcher>
            <RecommendContainer />
          </RecommendedProductTabsFetcher>
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default RecommendPage;
