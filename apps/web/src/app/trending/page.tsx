import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import { Suspense } from 'react';
import TrendingContainer from './components/TrendingContainer';

const TrendingPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <Suspense>
          <TrendingContainer />
        </Suspense>
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;
