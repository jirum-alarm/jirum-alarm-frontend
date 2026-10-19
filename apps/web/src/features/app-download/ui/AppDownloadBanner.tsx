'use client';

import { CheckDeviceResult } from '@/shared/actions/agent.types';
import useAppDownloadLink from '@/shared/hooks/useAppDownloadLink';
import OpenInAppLink from '@/shared/ui/app-handoff/OpenInAppLink';
import { AppIcon } from '@/shared/ui/common/icons/Illust';

type AppDownloadBannerProps = { device: CheckDeviceResult } | { type: 'apple' | 'android' | null };

const AppDownloadBanner = (props: AppDownloadBannerProps) => {
  const appDownloadLink = useAppDownloadLink(
    'device' in props ? props.device : (null as unknown as CheckDeviceResult),
  );
  const { type } = 'device' in props ? appDownloadLink : props;

  if (type === null) return null;

  return (
    <>
      {type && (
        <div className="from-secondary-50 to-secondary-100 flex h-[92px] w-full items-center gap-3 overflow-hidden rounded-lg border border-gray-600 bg-linear-to-b px-5">
          <div className="shrink-0">
            <AppIcon />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-left leading-none">
              <span className="text-secondary-800 block text-sm leading-4.5 font-semibold">
                지름알림 앱 다운받고
              </span>
              <span className="text-secondary-700 text-13 block leading-[17px]">
                핫딜을 실시간으로 확인하세요!
              </span>
            </p>
          </div>
          <div className="shrink-0">
            {/* 앱이 있는 안드로이드는 앱이 바로 열린다. 홈·로그인·실시간 어디에 놓여도 앱 첫 화면으로. */}
            <OpenInAppLink
              platform={type}
              path="/"
              source="banner"
              className="bg-secondary-600 flex h-8 w-20 items-center justify-center rounded-xl text-sm font-semibold text-white"
            >
              다운받기
            </OpenInAppLink>
          </div>
        </div>
      )}
    </>
  );
};

export default AppDownloadBanner;
