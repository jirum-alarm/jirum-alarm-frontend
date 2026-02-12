import { cn } from '@/shared/lib/cn';
import { IconLogo } from '@/shared/ui/common/icons/Illust';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = async () => {
  return (
    <div className={cn('max-w-mobile-max fixed top-0 z-0 mx-auto h-[50dvh] w-full bg-gray-900')}>
      <div className="max-w-mobile-max mx-auto w-full">
        <header className="flex h-14 w-full items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <IconLogo />
            <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
          </div>
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper />
      </div>
    </div>
  );
};

export default BackgroundHeader;
