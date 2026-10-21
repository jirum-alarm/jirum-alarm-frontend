'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useDevice } from '@/hooks/useDevice';
import { cn } from '@/shared/libs/cn';

// 놓이는 자리 — 스토어 링크의 캠페인 값이자 바탕색. key-visual = 짙은 히어로(왼쪽 정렬), footer = 마지막 라임 띠(가운데).
type Position = 'key-visual' | 'footer';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

// 소개 페이지발 설치를 스토어 콘솔에서 가르기 위한 캠페인 값. Play 는 referrer 가 그대로 획득 보고서에 잡힌다.
// ponytail: App Store 는 pt(provider token) 없이 ct 만으론 App Analytics 에 안 잡힌다 — GA4 link_url 구분용. pt 받으면 추가.
const googlePlayLink = (position: Position) =>
  `${GooglePlayLink}&referrer=${encodeURIComponent(`utm_source=about-us&utm_medium=landing&utm_content=${position}`)}`;
const appStoreLink = (position: Position) => `${AppStoreLink}?ct=about-us-${position}`;

// 라임 띠 위에선 짙은 버튼(라임 위 흰 글자·반투명 흰 판은 안 읽힌다), 짙은 히어로 위에선 반투명 흰 판.
const storeButton = (position: Position) =>
  cn(
    'flex h-11 w-38.5 items-center justify-center gap-x-1 rounded-lg',
    position === 'footer'
      ? 'bg-fixed-900 text-fixed-white'
      : 'text-fixed-300 border border-white/40 bg-white/10',
  );

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
  // 마운트 전(undefined)에도 버튼 자리를 그려 둔다 — 나중에 끼어들면 아래 내용이 밀린다.
  const single = downloadType !== null;
  return (
    <div className="pt-6 lg:pt-8">
      {/* PC 에서 스토어 버튼은 데스크톱 웹 스토어를 열 뿐 설치로 안 이어진다 → 폰으로 찍는 QR 을 앞세운다.
          QR 은 web /app(스캔한 폰 UA 로 스토어 분기)에 착지하고 utm_source=about-us 로 소개 페이지발을 가른다. */}
      <div
        className={cn(
          'hidden flex-col gap-y-3 lg:flex',
          type === 'footer' ? 'items-center' : 'items-start',
        )}
      >
        <div className="flex items-center gap-x-4">
          <Image
            unoptimized
            src="/assets/images/app-qr.svg"
            alt="지름알림 앱 설치 QR 코드"
            width={100}
            height={100}
            className="size-25 rounded-lg bg-white p-1.5"
          />
          <div className="flex flex-col gap-y-3">
            <AppStoreDownload position={type} />
            <GooglePlayDownload position={type} />
          </div>
        </div>
        <p className={cn('text-sm', type === 'footer' ? 'text-fixed-800' : 'text-fixed-400')}>
          휴대폰 카메라로 QR 을 찍으면 바로 설치할 수 있어요
        </p>
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
          className={cn(
            'mt-5 block w-full rounded-full px-8.75 py-3 text-center text-lg leading-none font-bold lg:hidden',
            type === 'footer' ? 'bg-fixed-900 text-fixed-white' : 'bg-primary-500 text-fixed-900',
          )}
        >
          앱 다운로드
        </Link>
      )}
      {downloadType === null && (
        <div className="flex gap-x-6 lg:hidden">
          <AppStoreDownload position={type} />
          <GooglePlayDownload position={type} />
        </div>
      )}
    </div>
  );
};

export default AppDownload;

const AppStoreDownload = ({ position }: { position: Position }) => {
  return (
    <Link href={appStoreLink(position)} target="_blank" className={storeButton(position)}>
      <div className="-ml-1 flex size-8 items-center justify-center">
        <Image src="/assets/icons/apple.svg" alt="" unoptimized width={20} height={26} />
      </div>
      App Store
    </Link>
  );
};

const GooglePlayDownload = ({ position }: { position: Position }) => {
  return (
    <Link href={googlePlayLink(position)} target="_blank" className={storeButton(position)}>
      <Image
        unoptimized
        src="/assets/icons/google-play.png"
        alt=""
        className="size-8"
        width={32}
        height={32}
      />
      Google Play
    </Link>
  );
};
