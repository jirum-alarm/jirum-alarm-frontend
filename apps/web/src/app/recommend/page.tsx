import BasicLayout from '@/components/layout/BasicLayout';
import RecommendPageHeader from '@/app/recommend/components/RecommendPageHeader';
import RecommendContainer from '@/app/recommend/components/RecommendContainer';
import { Suspense } from 'react';
import RecommendedProductTabsFetcher from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductTabsFetcher';

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
