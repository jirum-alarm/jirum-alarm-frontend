import { checkDevice } from '@/app/actions/agent';
import { IllustIcons, RoundedLogo } from '@/components/common/icons';
import SearchLinkButton from '@/components/SearchLinkButton';
import { cn } from '@/lib/cn';

import AppDownloadCTA from '../AppDownloadCTA';
import AboutLink from '../banner/AboutLink';
import KakaoOpenChatLink from '../banner/KakaoOpenChatLink';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = async () => {
  const { isSafari } = await checkDevice();

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
            <IllustIcons.IconLogo />
            <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
          </div>
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper>
          <AppDownloadCTA />
          <KakaoOpenChatLink />
          <AboutLink />
          <AppDownloadCTA />
          <KakaoOpenChatLink />
          <AboutLink />
        </BannerSwiper>
      </div>
    </div>
  );
};

export default BackgroundHeader;
