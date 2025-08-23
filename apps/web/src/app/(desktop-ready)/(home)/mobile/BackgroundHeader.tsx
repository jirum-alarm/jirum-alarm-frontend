import { checkDevice } from '@/app/actions/agent';
import { IconLogo } from '@/components/common/icons/Illust';
import SearchLinkButton from '@/components/SearchLinkButton';
import { cn } from '@/lib/cn';

import BannerSwiper from './BannerSwiper';

const BackgroundHeader = async () => {
  const device = await checkDevice();

  return (
    <div
      className={cn(
        'max-w-mobile-max fixed top-0 z-0 mx-auto h-[300px] w-full bg-gray-900',
        device.isSafari && 'top-[0.5px]',
      )}
    >
      <div className="max-w-mobile-max mx-auto w-full">
        <header className="flex h-14 w-full items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <IconLogo />
            <h2 className="text-lg font-bold text-slate-50">지름알림</h2>
          </div>
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper device={device} />
      </div>
    </div>
  );
};

export default BackgroundHeader;
