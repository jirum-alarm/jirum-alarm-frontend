import { ArrowRight, RoundedLogo } from '@/components/common/icons';
import HomeHeader from './HomeHeader';
import SearchButton from './SearchButton';
import LiveHotDealContainer from './LiveHotDealContainer';
import TopButton from './TopButton';
import BottomNav, { NAV_TYPE } from '@/components/layout/BottomNav';
import JirumRankingContainer from './JirumRankingContainer';
import Link from 'next/link';

const HomeContainerV2 = () => {
  return (
    <div className="mx-auto h-full max-w-screen-md pb-20">
      <HomeHeader />
      <div className="bg-gray-900">
        <HomeBackgroundHeader />
        <main className="relative z-10 w-full rounded-t-[1.25rem] bg-white pt-3">
          <JirumRankingContainer />
          <div className="h-[20px]" />
          <LiveHotDealContainer />
        </main>
      </div>
      <BottomNav type={NAV_TYPE.HOME} />
      <TopButton />
    </div>
  );
};

export default HomeContainerV2;

const HomeBackgroundHeader = () => {
  return (
    <div className="sticky top-0">
      <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <RoundedLogo />
          <h2 className="text-lg font-semibold text-white">지름알림</h2>
        </div>
        <SearchButton />
      </header>
      <div className="px-5 py-2">
        <Link
          className="flex h-[64px] w-full items-center justify-between bg-gray-800 px-4 py-3"
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
