import Banner from './Banner';
import JirumRankingContainer from './JirumRankingContainer';

const HeroSection = () => {
  return (
    <div className="fixed top-0 z-0 h-[100dvh] w-full min-w-[1024px] bg-gray-900">
      <div className="mx-auto max-w-screen-layout-max">
        <JirumRankingContainer />
        <Banner />
      </div>
    </div>
  );
};

export default HeroSection;
