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
        <div className="h-[20px]" />
      </>
    );
  };

  return (
    <div className="mx-auto h-full w-full max-w-screen-mobile-max pb-[70px] pc:max-w-none">
      <DeviceSpecific desktop={renderDesktop} />
      <main className="relative z-10 mx-auto mt-[153px] h-full max-w-screen-mobile-max rounded-t-[1.25rem] bg-white pt-3 pc:mt-[770px] pc:w-full pc:max-w-none pc:rounded-t-[1.75rem] pc:pt-[72px]">
        <div className="pc:mx-auto pc:max-w-screen-layout-max">
          <DeviceSpecific mobile={renderMobile} />
          <div className="flex flex-col gap-y-8 py-3 pc:gap-y-[60px] pc:pt-0">
            <RecommendedProductSection />
            <LiveHotDealSection />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomeContainerV2;
