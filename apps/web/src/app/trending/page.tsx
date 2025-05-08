import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';

import { checkJirumAlarmApp } from '../actions/agent';

import TrendingContainerServer from './components/trending-container/server';
import TrendingPageHeader from './components/TrendingPageHeader';

const TrendingPage = ({ searchParams }: { searchParams: { tab: string } }) => {
  const tab = searchParams.tab ? Number(searchParams.tab) : 0;
  const { isJirumAlarmApp } = checkJirumAlarmApp();

  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full">
        <Suspense
          fallback={
            <div className="-mt-10 flex h-full w-full items-center justify-center">
              <LoadingSpinner width={50} height={50} />
            </div>
          }
        >
          <TrendingContainerServer tab={tab} />
        </Suspense>
      </div>
      <TopButton hasBottomNav={!isJirumAlarmApp} />
    </BasicLayout>
  );
};

export default TrendingPage;
