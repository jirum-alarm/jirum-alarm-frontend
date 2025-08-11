import DeviceSpecific from '@/components/layout/DeviceSpecific';

import { LiveHotDealSection } from '@widgets/live-hotdeal';
import { RecommendedProductSection } from '@widgets/recommend';

import DesktopHeroSection from '../desktop/HeroSection';
import MobileJirumRankingContainer from '../mobile/JirumRankingContainer';

const HomeContainerV2 = () => {
  const renderDesktop = () => {
    return (
      <>
        <DesktopHeroSection />
      </>
    );
  };

  const renderMobile = () => {
    return (
      <>
        <MobileJirumRankingContainer />
        <div className="h-5" />
      </>
    );
  };

  return (
    <div className="pc:max-w-none max-w-mobile-max mx-auto h-full w-full pb-[70px]">
      <DeviceSpecific desktop={renderDesktop} />
      <main className="pc:mt-[770px] pc:w-full pc:max-w-none pc:rounded-t-[1.75rem] pc:pt-[72px] max-w-mobile-max relative z-10 mx-auto mt-[153px] h-full rounded-t-[1.25rem] bg-white pt-3">
        <div className="pc:mx-auto pc:max-w-layout-max">
          <DeviceSpecific mobile={renderMobile} />
          <div className="pc:gap-y-15 pc:pt-0 flex flex-col gap-y-8 py-3">
            <RecommendedProductSection />
            <LiveHotDealSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeContainerV2;
