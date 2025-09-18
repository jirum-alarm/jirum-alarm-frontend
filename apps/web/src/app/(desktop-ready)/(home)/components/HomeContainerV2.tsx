import Link from 'next/link';

import { checkDevice } from '@/app/actions/agent';
import ImageComponent from '@/components/ImageComponent';
import { Advertisement } from '@/constants/advertisement';

import { LiveHotDealSection } from '@widgets/live-hotdeal';
import { RecommendedProductSection } from '@widgets/recommend';

import DesktopHeroSection from '../desktop/HeroSection';
import MobileBackgroundHeader from '../mobile/BackgroundHeader';
import MobileHomeHeader from '../mobile/HomeHeader';
import MobileJirumRankingContainer from '../mobile/JirumRankingContainer';

async function HomeContainerV2() {
  const { isMobile } = await checkDevice();

  const renderDesktop = () => {
    return (
      <>
        <DesktopHeroSection />
      </>
    );
  };

  const renderMobile = () => {
    {
      return (
        <>
          <MobileHomeHeader />
          <MobileBackgroundHeader />
        </>
      );
    }
  };

  const renderMobileRanking = () => {
    return (
      <>
        <MobileJirumRankingContainer />
        <div className="h-5" />
      </>
    );
  };

  return (
    <div className="pc:max-w-none max-w-mobile-max mx-auto h-full w-full overflow-x-hidden pb-[70px]">
      {!isMobile ? renderDesktop() : renderMobile()}
      <main className="pc:mt-[770px] pc:w-full pc:max-w-none pc:rounded-t-[1.75rem] pc:pt-[72px] max-w-mobile-max relative z-10 mt-[158px] rounded-t-[1.25rem] bg-white pt-3">
        <div className="pc:mx-auto pc:max-w-layout-max">
          {!isMobile ? null : renderMobileRanking()}
          <div className="pc:gap-y-15 pc:pt-0 pc:px-5 flex flex-col gap-y-8 py-3">
            <div>
              {Advertisement.Persil.isInPeriod() && <AdPersilBanner />}
              {/* <AdPersilBanner /> */}
              <RecommendedProductSection />
              <LiveHotDealSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default HomeContainerV2;

const AdPersilBanner = () => {
  return (
    <div className="px-[20px] pt-[8px] pb-[28px]" id="ad-pirsil-banner-20250917">
      <Link
        className="relative block h-[100px] rounded-[8px]"
        href={Advertisement.Persil.url}
        target="_blank"
      >
        <ImageComponent
          className="rounded-[8px] object-cover"
          src="/ad_persil_banner.jpg"
          alt="ad-persil-banner"
          fill
        />
        <div className="bg-opacity-90 absolute right-[5px] bottom-[10px] w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[8px] pt-[3px] pb-[3px] text-xs font-medium text-white">
          AD
        </div>
      </Link>
    </div>
  );
};
