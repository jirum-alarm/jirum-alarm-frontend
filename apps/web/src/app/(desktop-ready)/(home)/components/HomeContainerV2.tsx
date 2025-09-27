import Image from 'next/image';
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
              {!isMobile && Advertisement.Beproc.isInPeriod() && <AdBeprocBanner />}
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
        className="relative block h-[100px] overflow-hidden rounded-[8px] bg-linear-180 from-[#d3e5ff] to-[#8cbbf7]"
        href={Advertisement.Persil.url}
        target="_blank"
      >
        <div className="absolute top-0 left-0 z-10 h-24 w-full bg-linear-0 from-[#e4efff_0%] to-[#e4efff]" />
        <div className="absolute bottom-[7px] left-[calc(50%_-_135px)] h-[271px] w-[271px] rounded-[50%] bg-radial-[at_50%_50%] from-[#b6d5ff_62.08%] to-[#cee3ff] shadow-[0px_4px_20px_rgba(255,_255,_255,_0.1)]" />
        <div className="relative z-20 mx-auto flex h-[100px] w-full max-w-[460px] shrink-0 justify-between px-4 py-3">
          <div className="flex flex-col justify-between overflow-hidden rounded-lg text-left">
            <div>
              <div className="flex items-center text-lg text-[#0054d4]">
                <b className="mr-1.5">{Advertisement.Persil.title}</b>
                <b className="mr-0.5">{Advertisement.Persil.discountRate}</b>
                <div className="text-[13px] leading-[18px] font-semibold">%</div>
              </div>
              <div className="text-[13px] leading-[18px] font-medium text-[#0040a1]">
                {Advertisement.Persil.description}
              </div>
            </div>
            <div className="text-[11px] leading-[14px] text-[#062f6a] opacity-[0.8]">
              {Advertisement.Persil.period}
            </div>
          </div>
          <Image
            className="h-[81px] w-[105px] object-cover"
            src="/ad_persil_banner_img.png"
            alt=""
            width={105}
            height={81}
          />
        </div>
        <div className="bg-opacity-90 absolute right-[12px] bottom-[12px] z-30 w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[8px] py-[4px] text-xs leading-none font-medium text-white">
          AD
        </div>
      </Link>
    </div>
  );
};

const AdBeprocBanner = () => {
  return (
    <div className="px-[20px] pt-[8px] pb-[28px]" id="ad-pirsil-banner-20250917">
      <Link
        className="relative block h-[100px] overflow-hidden rounded-[8px] bg-linear-90 from-[#ced4e0] to-[#E6ECF5]"
        href={Advertisement.Beproc.url}
        target="_blank"
      >
        <div className="relative z-20 mx-auto flex h-[100px] w-full max-w-[460px] shrink-0 justify-between px-4 py-3">
          <div className="flex flex-col justify-center overflow-hidden rounded-lg text-left">
            <div>
              <div className="mb-1 flex items-center text-lg text-[#0054d4]">
                <span className="text-secondary-800 mr-1.5 font-semibold">
                  비프록 음식물 처리기 <b className="text-[#0036B1]">추석특가</b>
                </span>
              </div>
              <div className="text-[13px] leading-[18px] font-medium text-gray-700">
                오직 <b>지름알림</b>에서만 <b className="text-secondary-600">70% 할인</b>
              </div>
            </div>
          </div>
          <Image
            className="h-[81px] w-[105px] object-cover"
            src="/beproc_ad_banner_img.png"
            alt=""
            width={105}
            height={81}
          />
        </div>
        <div className="bg-opacity-90 absolute right-[12px] bottom-[12px] z-30 w-fit rounded-[8px] border border-white bg-[#98A2B3] px-[8px] py-[4px] text-xs leading-none font-medium text-white">
          AD
        </div>
      </Link>
    </div>
  );
};
