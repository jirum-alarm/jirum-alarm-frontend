'use client';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TrendingContainer from './components/TrendingContainer';
import TopButton from '@/components/TopButton';
import TrendingPageHeader from './components/TrendingPageHeader';

const TrendingPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <TrendingContainer />
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;
