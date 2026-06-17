import Banner from './Banner';
import JirumRankingContainer from './JirumRankingContainer';

const HeroSection = () => {
  return (
    <div className="bg-surface-inverse fixed top-0 z-0 h-[820px] w-full min-w-5xl">
      <div className="max-w-layout-max mx-auto px-9">
        <JirumRankingContainer />
        <Banner />
      </div>
    </div>
  );
};

export default HeroSection;
