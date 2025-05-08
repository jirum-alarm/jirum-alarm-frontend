import RecommendedProductContainer from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductContainer';
import TopButton from '@/components/TopButton';

import BackgroundHeader from './BackgroundHeader';
import HomeHeader from './HomeHeader';
import JirumRankingContainer from './JirumRankingContainer';
import LiveHotDealContainer from './LiveHotDealContainer';

const HomeContainerV2 = ({ isJirumAlarmApp }: { isJirumAlarmApp: boolean }) => {
  return (
    <div className="mx-auto h-full max-w-screen-layout-max pb-[70px]">
      <HomeHeader />
      <div>
        <BackgroundHeader />
        <main className="relative z-10 mt-[144px] w-full rounded-t-[1.25rem] bg-white pt-3">
          <JirumRankingContainer />
          <div className="h-[20px]" />
          <div className="flex flex-col gap-y-8 py-3">
            <RecommendedProductContainer />
            <LiveHotDealContainer />
          </div>
        </main>
      </div>
      <TopButton hasBottomNav={!isJirumAlarmApp} />
    </div>
  );
};

export default HomeContainerV2;
