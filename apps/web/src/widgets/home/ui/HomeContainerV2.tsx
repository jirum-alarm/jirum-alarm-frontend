import DesktopHeroSection from '@/app/(desktop-ready)/(home)/desktop/HeroSection';
import MobileBackgroundHeader from '@/app/(desktop-ready)/(home)/mobile/BackgroundHeader';
import MobileHomeHeader from '@/app/(desktop-ready)/(home)/mobile/HomeHeader';
import MobileJirumRankingContainer from '@/app/(desktop-ready)/(home)/mobile/JirumRankingContainer';
import { checkDevice } from '@/app/actions/agent';
import { getPromotionSections } from '@entities/promotion';

import Footer from '@/widgets/layout/ui/desktop/Footer';

import AdPersilBanner20251124 from './AdPersilBanner20251124';
import PromotionSectionList from './PromotionSectionList';

async function HomeContainerV2() {
  const { isMobile } = await checkDevice();
  const sections = getPromotionSections();

  return (
    <div className="pc:max-w-none max-w-mobile-max mx-auto h-full w-full overflow-x-hidden">
      {!isMobile ? (
        <DesktopHeroSection />
      ) : (
        <>
          <MobileHomeHeader />
          <MobileBackgroundHeader />
        </>
      )}
      <main className="pc:mt-[770px] pc:w-full pc:max-w-none pc:rounded-t-[1.75rem] pc:pt-[72px] max-w-mobile-max relative z-10 mt-[160px] rounded-t-[1.25rem] bg-white pt-3">
        <div className="pc:mx-auto pc:max-w-layout-max">
          {isMobile ? (
            <>
              <MobileJirumRankingContainer />
              <div className="h-5" />
            </>
          ) : null}
          <div className="pc:gap-y-15 pc:pt-0 pc:px-5 flex flex-col gap-y-8 py-14">
            <AdPersilBanner20251124 />
            <div>
              <PromotionSectionList sections={sections} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default HomeContainerV2;
