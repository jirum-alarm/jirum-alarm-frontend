'use client';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';
import { AppIcon } from '@/shared/ui/common/icons/Illust';

type AppDownloadBannerProps =
  | { device: CheckDeviceResult }
  | { type: 'apple' | 'android' | null; link?: string | null };

const AppDownloadBanner = (props: AppDownloadBannerProps) => {
  const appDownloadLink = useAppDownloadLink(
    'device' in props ? props.device : (null as unknown as CheckDeviceResult),
  );
  const { type, link } = 'device' in props ? appDownloadLink : props;

  const handleAppDownloadClick = () => {
    if (!type) return;
  };

  if (type === null) return null;

  return (
    <>
      {type && link && (
        <div className="from-secondary-50 to-secondary-100 flex h-[84px] w-full items-center gap-3 overflow-hidden bg-linear-to-b px-5">
          <div className="shrink-0">
            <AppIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-left leading-none">
              <span className="text-secondary-800 block text-[14px] leading-[18px] font-semibold">
                지름알림 앱 다운받고
              </span>
              <span className="text-secondary-700 block text-[13px] leading-[17px]">
                핫딜을 실시간으로 확인하세요!
              </span>
            </p>
          </div>
          <div className="shrink-0">
            <a
              href={link}
              onClick={handleAppDownloadClick}
              className="bg-secondary-600 flex h-[32px] w-20 items-center justify-center rounded-xl text-sm font-semibold text-white"
            >
              다운받기
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default AppDownloadBanner;
