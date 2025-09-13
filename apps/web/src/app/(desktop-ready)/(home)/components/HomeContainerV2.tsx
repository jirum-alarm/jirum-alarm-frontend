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
              {Advertisement.Persil.isInPeriod && <AdPersilBanner />}
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
    <div className="px-[20px] pt-[8px] pb-[28px]">
      <Link
        className="relative block h-[100px] rounded-[8px] bg-gradient-to-r from-[#C8CFFF] to-[#E4EBFF] px-[5px] py-[10px] pl-[19px]"
        href={Advertisement.Persil.url}
        target="_blank"
      >
        <div className="relative flex w-full justify-center">
          <div className="flex w-full max-w-[648px] items-center justify-between">
            <div>
              <div className="flex items-center gap-[9px]">
                <p className="text-lg font-bold text-[#3B0090]">여름철 필수템</p>
                <div className="h-[19px] w-fit rounded-[8px] bg-white px-[10px] pt-[2px] pb-[4px] text-xs font-medium text-[#909CEA]">
                  event
                </div>
              </div>
              <p className="text-sm font-semibold text-[#5C3297]">
                세제 핫딜 모음전을 확인해 보세요!
              </p>
            </div>
            <div>
              <ImageComponent
                src="/cleanser-icon.png"
                width={120}
                height={120}
                alt="cleanser-icon"
                priority
                loading="eager"
                fetchPriority="high"
                placeholder="empty"
                className="object-contain"
              />
            </div>
          </div>
          <div className="bg-opacity-90 absolute right-0 bottom-0 w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[8px] pt-[3px] pb-[3px] text-xs font-medium text-white">
            AD
          </div>
        </div>
      </Link>
    </div>
  );
};
