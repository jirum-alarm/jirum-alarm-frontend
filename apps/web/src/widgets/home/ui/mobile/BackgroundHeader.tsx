import { cn } from '@/shared/lib/cn';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = async () => {
  return (
    <div className={cn('max-w-mobile-max fixed top-0 z-0 mx-auto h-[50dvh] w-full bg-gray-900')}>
      <div className="max-w-mobile-max mx-auto w-full">
        <header className="flex h-14 w-full items-center justify-between px-5 py-3">
          <LogoLink inverted />
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper />
      </div>
    </div>
  );
};

export default BackgroundHeader;
