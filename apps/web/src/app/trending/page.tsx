import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';
import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/icons';
// import TrendingContainer from './components/TrendingContainer';
import dynamic from 'next/dynamic';
const TrendingContainer = dynamic(() => import('./components/TrendingContainer'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner width={70} height={70} />
    </div>
  ),
});

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
