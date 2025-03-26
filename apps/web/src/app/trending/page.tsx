import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';

import TrendingContainerServer from './components/trending-container/server';
import TrendingPageHeader from './components/TrendingPageHeader';

const TrendingPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <Suspense
          fallback={
            <div className="-mt-10 flex h-full w-full items-center justify-center">
              <LoadingSpinner width={50} height={50} />
            </div>
          }
        >
          <TrendingContainerServer />
        </Suspense>
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;
