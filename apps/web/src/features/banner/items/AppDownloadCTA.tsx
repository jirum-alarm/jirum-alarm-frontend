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
        <div className="border-secondary-700 bg-secondary-800 flex h-[76px] w-full items-center rounded-[8px] border px-[16px]">
          <AppIcon />
          <div className="ml-[14px]">
            <p>
              <span className="font-medium text-white">
                지름알림 앱 <strong className="text-secondary-200 font-semibold">다운받고</strong>
              </span>
              <br />
              <span className="text-s text-gray-200">핫딜을 실시간으로 확인하세요!</span>
            </p>
          </div>
          <div className="ml-auto">
            <a
              href={link}
              onClick={handleAppDownloadClick}
              className="rounded-5 bg-secondary-50 text-secondary-700 block h-[32px] px-[12px] py-[6px] text-sm font-semibold"
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
