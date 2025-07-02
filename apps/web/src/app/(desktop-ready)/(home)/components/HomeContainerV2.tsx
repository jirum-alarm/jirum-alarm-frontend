import withCheckDevice from '@/components/hoc/withCheckDevice';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import RecommendedProductSection from '@/features/recommended/RecommendedProductSection';
import { cn } from '@/lib/cn';

import DesktopHeroSection from './desktop/HeroSection';
import LiveHotDealSection from './LiveHotDealSection';
import MobileBackgroundHeader from './mobile/BackgroundHeader';
import MobileHomeHeader from './mobile/HomeHeader';
import MobileJirumRankingContainer from './mobile/JirumRankingContainer';

const RecommendedProductSectionHOC = withCheckDevice(RecommendedProductSection);

const HomeContainerV2 = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div
      className={cn('h-full w-full pb-[70px]', {
        'mx-auto': !isMobile,
        'mx-auto max-w-screen-mobile-max': isMobile,
      })}
    >
      <DeviceSpecific mobile={<MobileHomeHeader />} />
      <DeviceSpecific mobile={<MobileBackgroundHeader />} desktop={<DesktopHeroSection />} />
      <div>
        <main
          className={cn(
            'relative z-10 h-full bg-white',
            isMobile
              ? 'mx-auto mt-[153px] max-w-screen-mobile-max rounded-t-[1.25rem] pt-3'
              : 'mx-auto mt-[770px] w-full rounded-t-[1.75rem] pt-[72px]',
          )}
        >
          <div
            className={cn({
              'mx-auto max-w-screen-layout-max': !isMobile,
            })}
          >
            <DeviceSpecific
              mobile={
                <>
                  <MobileJirumRankingContainer />
                  <div className="h-[20px]" />
                </>
              }
            />
            <div
              className={cn('flex flex-col gap-y-8 py-3', {
                'gap-y-[60px] pt-0': !isMobile,
              })}
            >
              <RecommendedProductSectionHOC />
              <LiveHotDealSection />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default HomeContainerV2;
