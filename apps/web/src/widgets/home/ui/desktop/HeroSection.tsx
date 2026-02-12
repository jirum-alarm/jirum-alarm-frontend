import Banner from './Banner';
import JirumRankingContainer from './JirumRankingContainer';

const HeroSection = () => {
  return (
    <div className="fixed top-0 z-0 h-[820px] w-full min-w-5xl bg-gray-900">
      <div className="max-w-layout-max mx-auto px-9">
        <JirumRankingContainer />
        <Banner />
      </div>
    </div>
  );
};

export default HeroSection;
