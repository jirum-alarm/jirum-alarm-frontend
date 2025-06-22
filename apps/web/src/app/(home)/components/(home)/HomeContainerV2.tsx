import RecommendedProductContainer from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductContainer';
import TopButton from '@/components/TopButton';

import BackgroundHeader from './BackgroundHeader';
import HomeHeader from './HomeHeader';
import JirumRankingContainer from './JirumRankingContainer';
import LiveHotDealContainer from './LiveHotDealContainer';

const HomeContainerV2 = ({ isSafari, isMobile }: { isSafari: boolean; isMobile: boolean }) => {
  return (
    <div className="mx-auto h-full w-full pb-[70px]">
      <HomeHeader isMobile={isMobile} />
      <BackgroundHeader hasTopPadding={isSafari} isMobile={isMobile} />
      <div>
        <main className="relative z-10 mt-[144px] h-full w-full rounded-t-[1.25rem] bg-white pt-3 lg:mt-[800px]">
          <JirumRankingContainer isMobile={isMobile} />
          <div className="h-[20px]" />
          <div className="flex flex-col gap-y-8 py-3 lg:mx-auto lg:max-w-screen-layout-max">
            <RecommendedProductContainer />
            <LiveHotDealContainer />
          </div>
        </main>
      </div>
      <TopButton hasBottomNav={true} />
    </div>
  );
};

export default HomeContainerV2;
