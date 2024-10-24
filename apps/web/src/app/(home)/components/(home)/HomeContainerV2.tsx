import Link from 'next/link';

import HomeHeader from './HomeHeader';
import JirumRankingContainer from './JirumRankingContainer';
import LiveHotDealContainer from './LiveHotDealContainer';
import SearchButton from '../../../../components/SearchLinkButton';

import { ArrowRight, RoundedLogo } from '@/components/common/icons';
import TopButton from '@/components/TopButton';

const HomeContainerV2 = () => {
  return (
    <div className="mx-auto h-full max-w-screen-layout-max pb-[70px]">
      <HomeHeader />
      <div>
        <HomeBackgroundHeader />
        <main className="relative z-10 mt-[136px] w-full rounded-t-[1.25rem] bg-white pt-3">
          <JirumRankingContainer />
          <div className="h-[20px]" />
          <LiveHotDealContainer />
        </main>
      </div>
      <TopButton />
    </div>
  );
};

export default HomeContainerV2;

const HomeBackgroundHeader = () => {
  return (
    <div className="fixed top-0 z-0 h-full w-full max-w-screen-layout-max bg-gray-900">
      <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <RoundedLogo />
          <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
        </div>
        <SearchButton />
      </header>
      <div className="px-5 py-2">
        <Link
          className="flex h-[64px] w-full items-center justify-between rounded-lg bg-gray-800 px-4 py-3"
          href={'/alarm'}
        >
          <p className="text-left">
            <span className="text-sm text-gray-100">핫딜을 더 빠르게 보고 싶다면?</span>
            <br />
            <span className="text-xs text-gray-200">
              키워드 알림으로 원하는 핫딜만 골라 보세요!
            </span>
          </p>
          <ArrowRight color="#E4E7EC" />
        </Link>
      </div>
    </div>
  );
};
