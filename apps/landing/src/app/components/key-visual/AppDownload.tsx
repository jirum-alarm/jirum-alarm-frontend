'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useDevice } from '@/hooks/useDevice';

type Position = 'key-visual' | 'footer';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/kr/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

// 소개 페이지발 설치를 스토어 콘솔에서 가르기 위한 캠페인 값. Play 는 referrer 가 그대로 획득 보고서에 잡힌다.
// ponytail: App Store 는 pt(provider token) 없이 ct 만으론 App Analytics 에 안 잡힌다 — GA4 link_url 구분용. pt 받으면 추가.
const googlePlayLink = (position: Position) =>
  `${GooglePlayLink}&referrer=${encodeURIComponent(`utm_source=about-us&utm_medium=landing&utm_content=${position}`)}`;
const appStoreLink = (position: Position) => `${AppStoreLink}?ct=about-us-${position}`;

const useDownloadType = () => {
  const { isApple, isAndroid, isMounted } = useDevice();

  if (!isMounted) return undefined;
  if (isApple) return 'apple';
  if (isAndroid) return 'android';
  return null;
};

const AppDownload = ({ type }: { type: Position }) => {
  const downloadType = useDownloadType();
  // 판별 불가(null, 데스크톱 좁은 창 등)면 '#' 버튼 대신 두 스토어를 다 보여준다.
  const single = type === 'key-visual' && downloadType !== null;
  return (
    <div className="pt-6 lg:pt-8">
      <div className="hidden gap-x-6 lg:flex">
        <AppStoreDownload position={type} />
        <GooglePlayDownload position={type} />
      </div>
      {single && (
        <Link
          href={
            downloadType === 'apple'
              ? appStoreLink(type)
              : downloadType === 'android'
                ? googlePlayLink(type)
                : '#'
          }
          target="_blank"
          className="mt-5 w-full rounded-full border border-white/40 bg-white/10 px-8.75 py-3 text-center text-lg leading-none font-bold text-gray-300 lg:hidden"
        >
          앱 다운로드
        </Link>
      )}
      {!single && (
        <div className="lg:hidden">
          {downloadType === 'apple' && <AppStoreDownload position={type} />}
          {downloadType === 'android' && <GooglePlayDownload position={type} />}
          {downloadType === null && (
            <div className="flex gap-x-6">
              <AppStoreDownload position={type} />
              <GooglePlayDownload position={type} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppDownload;

const AppStoreDownload = ({ position }: { position: Position }) => {
  return (
    <Link
      href={appStoreLink(position)}
      target="_blank"
      className="flex h-11 w-38.5 items-center justify-center gap-x-1 rounded-lg border border-white/40 bg-white/10 text-gray-300"
    >
      <div className="-ml-1 flex size-8 items-center justify-center">
        <Image src="/assets/icons/apple.svg" alt="apple" unoptimized width={20} height={26} />
      </div>
      App Store
    </Link>
  );
};

const GooglePlayDownload = ({ position }: { position: Position }) => {
  return (
    <Link
      href={googlePlayLink(position)}
      target="_blank"
      className="flex h-11 w-38.5 items-center justify-center gap-x-1 rounded-lg border border-white/40 bg-white/10 text-gray-300"
    >
      <Image
        unoptimized
        src="/assets/icons/google-play.png"
        alt="google"
        className="size-8"
        width={32}
        height={32}
      />
      Google Play
    </Link>
  );
};
