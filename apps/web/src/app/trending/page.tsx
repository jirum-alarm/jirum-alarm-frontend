import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import { TrendingContainerServer } from './components/trending-container/trending-server';
import { Suspense } from 'react';

const TrendingPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <Suspense>
          <TrendingContainerServer />
        </Suspense>
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;
