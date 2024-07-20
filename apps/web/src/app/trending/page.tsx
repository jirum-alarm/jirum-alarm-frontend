import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import React from 'react';
import SearchButton from '../(home)/components/(home)/SearchButton';
import TrendingContainer from './components/TrendingContainer';

const TrendingPage = () => {
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingHeader />}>
      <div className="h-full px-4 pt-[56px]">
        <TrendingContainer />
      </div>
      {/* <TopBu */}
    </BasicLayout>
  );
};

export default TrendingPage;

const TrendingHeader = () => {
  return (
    <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-[480px] items-center justify-between bg-white px-4">
      <h2 className="text-lg font-semibold">지름알림 랭킹</h2>
      <SearchButton color="#1d2939" />
    </header>
  );
};
