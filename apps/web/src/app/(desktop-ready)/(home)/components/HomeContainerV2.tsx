import DeviceSpecific from '@/components/layout/DeviceSpecific';
import RecommendedProductSection from '@/features/recommended/RecommendedProductSection';

import DesktopHeroSection from './desktop/HeroSection';
import LiveHotDealSection from './LiveHotDealSection';
import MobileBackgroundHeader from './mobile/BackgroundHeader';
import MobileHomeHeader from './mobile/HomeHeader';
import MobileJirumRankingContainer from './mobile/JirumRankingContainer';

const HomeContainerV2 = () => {
  const renderMobile = () => {
    return (
      <>
        <MobileHomeHeader />
        <MobileBackgroundHeader />
      </>
    );
  };

  const renderDesktop = () => {
    return (
      <>
        <DesktopHeroSection />
      </>
    );
  };

  return (
    <div className="mx-auto h-full w-full max-w-screen-mobile-max pb-[70px] pc:max-w-none">
      <DeviceSpecific mobile={renderMobile} desktop={renderDesktop} />
      <main className="relative z-10 mx-auto mt-[153px] h-full max-w-screen-mobile-max rounded-t-[1.25rem] bg-white pt-3 pc:mt-[770px] pc:w-full pc:max-w-none pc:rounded-t-[1.75rem] pc:pt-[72px]">
        <div className="pc:mx-auto pc:max-w-screen-layout-max">
          <DeviceSpecific
            mobile={() => (
              <>
                <MobileJirumRankingContainer />
                <div className="h-[20px]" />
              </>
            )}
          />
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
