import AdBanner from '@/features/banner/items/AdBanner';

import AboutLink from '@features/banner/items/AboutLink';
import KakaoOpenChatLink from '@features/banner/items/KakaoOpenChatLink';

const Banner = () => {
  return (
    <div className="max-w-slider-max mx-auto mt-8 mb-10 flex h-[120px] w-full gap-x-[25px]">
      {/* <AdBanner isMobile={false} /> */}
      <KakaoOpenChatLink isMobile={false} />
      <AboutLink isMobile={false} />
    </div>
  );
};

export default Banner;
