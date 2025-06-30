import { RoundedLogo } from '@/components/common/icons';
import SearchLinkButton from '@/components/SearchLinkButton';

import AboutLink from '../banner/AboutLink';
import KakaoOpenChatLink from '../banner/KakaoOpenChatLink';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = () => {
  return (
    <div className="fixed top-0 z-0 h-[300px] w-full max-w-screen-mobile-max bg-gray-900">
      <div className="mx-auto max-w-screen-mobile-max">
        <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <RoundedLogo />
            <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
          </div>
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper>
          <KakaoOpenChatLink />
          <AboutLink />
        </BannerSwiper>
      </div>
    </div>
  );
};

export default BackgroundHeader;
