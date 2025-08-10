import { checkDevice } from '@/app/actions/agent';
import { IconLogo } from '@/components/common/icons/Illust';
import SearchLinkButton from '@/components/SearchLinkButton';
import { cn } from '@/lib/cn';

import AboutLink from '@features/banner/items/AboutLink';
import AppDownloadCTA from '@features/banner/items/AppDownloadCTA';
import KakaoOpenChatLink from '@features/banner/items/KakaoOpenChatLink';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = async () => {
  const { isSafari, isMobile, isJirumAlarmApp } = await checkDevice();

  const isAppDownloadVisible = isMobile && !isJirumAlarmApp;

  return (
    <div
      className={cn(
        'fixed top-0 z-0 h-[300px] w-full max-w-screen-mobile-max bg-gray-900',
        isSafari && 'top-[0.5px]',
      )}
    >
      <div className="mx-auto max-w-screen-mobile-max">
        <header className="flex h-[56px] w-full items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <IconLogo />
            <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
          </div>
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper>
          {isAppDownloadVisible && <AppDownloadCTA />}
          <KakaoOpenChatLink />
          <AboutLink />
          {isAppDownloadVisible && <AppDownloadCTA />}
          <KakaoOpenChatLink />
          <AboutLink />
        </BannerSwiper>
      </div>
    </div>
  );
};

export default BackgroundHeader;
