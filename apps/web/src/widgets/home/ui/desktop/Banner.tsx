import { Advertisement } from '@/shared/config/advertisement';

import { AboutLink, AdBanner, KakaoOpenChatLink } from '@/features/banner';

const Banner = () => {
  const isPersilBanner = Advertisement.Persil_20251124.isInPeriod();

  return (
    <div className="max-w-slider-max mx-auto mt-8 mb-10 flex h-[120px] w-full gap-x-[25px]">
      {isPersilBanner ? (
        <AdBanner isMobile={false} />
      ) : (
        <>
          <KakaoOpenChatLink isMobile={false} />
          <AboutLink isMobile={false} />
        </>
      )}
    </div>
  );
};

export default Banner;
