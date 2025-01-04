import BackgroundHeader from './BackgronudHeader';
import HomeHeader from './HomeHeader';
import JirumRankingContainer from './JirumRankingContainer';
import LiveHotDealContainer from './LiveHotDealContainer';
import TopButton from '@/components/TopButton';
import RecommendedProductContainer from '@/app/(home)/components/(home)/RecommendedProduct/RecommendedProductContainer';

const HomeContainerV2 = () => {
  return (
    <div className="mx-auto h-full max-w-screen-layout-max pb-[70px]">
      <HomeHeader />
      <div>
        <BackgroundHeader />
        <main className="relative z-10 mt-[144px] w-full rounded-t-[1.25rem] bg-white pt-3">
          <JirumRankingContainer />
          <div className="h-[20px]" />
          <RecommendedProductContainer />
          <LiveHotDealContainer />
        </main>
      </div>
      <TopButton />
    </div>
  );
};

export default HomeContainerV2;
