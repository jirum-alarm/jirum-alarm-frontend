'use client';

import { AppIcon } from '@/components/common/icons/Illust';

import useAppDownloadLink from '@shared/hooks/useAppDownloadLink';

const AppDownloadCTA = () => {
  const { type, link } = useAppDownloadLink();

  const handleAppDownloadClick = () => {
    if (!type) return;
  };
  return (
    <>
      {type && link && (
        <div className="flex h-[84px] w-full items-center bg-gradient-to-b from-secondary-50 to-secondary-100 px-8">
          <AppIcon />
          <div className="ml-[14px]">
            <p className="text-left">
              <span className="font-semibold text-secondary-800">지름알림 앱 다운받고</span>
              <br />
              <span className="text-s text-secondary-700">핫딜을 실시간으로 확인하세요!</span>
            </p>
          </div>
          <div className="ml-auto">
            <a
              href={link}
              onClick={handleAppDownloadClick}
              className="flex h-[32px] w-20 items-center justify-center rounded-[20px] bg-secondary-600 text-sm font-semibold text-white"
            >
              다운받기
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default AppDownloadCTA;
