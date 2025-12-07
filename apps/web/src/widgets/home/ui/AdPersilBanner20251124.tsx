import Image from 'next/image';
import Link from 'next/link';

import { Advertisement } from '@/shared/config/advertisement';

const AdPersilBanner20251124 = () => {
  return (
    <div className="px-[20px] pt-[8px] pb-[28px]" id="ad-persil-banner-20251124">
      <Link
        className="relative block h-[100px] overflow-hidden rounded-[8px] bg-[url(/persil_2511_bg.svg)] bg-cover bg-center"
        href={Advertisement.Persil_20251124.url}
        target="_blank"
      >
        <div className="relative z-20 mx-auto flex h-[100px] w-full max-w-[460px] shrink-0 justify-between px-4 py-3">
          <div className="flex flex-col justify-between overflow-hidden rounded-lg text-left">
            <div>
              <div className="flex items-center text-lg text-white">
                <b className="mr-1.5 text-[22px]">{Advertisement.Persil_20251124.title}</b>
              </div>
              <div className="text-[13px] leading-[18px] font-medium text-[#DEEBFF]">
                {Advertisement.Persil_20251124.description}
              </div>
            </div>
            <div className="text-[11px] leading-[14px] text-[#DCD5FF] opacity-[0.8]">
              {Advertisement.Persil_20251124.period}
            </div>
          </div>
          <Image
            className="h-[81px] w-[105px] object-cover"
            src="/persil_2511_banner.png"
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

export default AdPersilBanner20251124;
