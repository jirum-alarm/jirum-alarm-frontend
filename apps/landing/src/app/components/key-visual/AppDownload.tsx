'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useDevice } from '@/hooks/useDevice';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

const useAppDownloadLink = () => {
  const { isApple, isAndroid, isMounted } = useDevice();

  if (!isMounted) {
    return { type: undefined, link: '#' } as const;
  }

  if (isApple) {
    return { type: 'apple', link: AppStoreLink } as const;
  }
  if (isAndroid) {
    return { type: 'android', link: GooglePlayLink } as const;
  }

  return { type: null, link: '#' } as const;
};

const AppDownload = ({ type }: { type: 'key-visual' | 'footer' }) => {
  const { link, type: downloadType } = useAppDownloadLink();
  return (
    <div className="pt-6 lg:pt-8">
      <div className="hidden gap-x-6 lg:flex">
        <AppStoreDownload />
        <GooglePlayDownload />
      </div>
      {type === 'key-visual' && (
        <Link
          href={link}
          target="_blank"
          className="mt-5 w-full rounded-full border border-white/40 bg-white/10 px-8.75 py-3 text-center text-lg leading-none font-bold text-gray-300 lg:hidden"
        >
          앱 다운로드
        </Link>
      )}
      {type === 'footer' && (
        <div className="lg:hidden">
          {downloadType === 'apple' && <AppStoreDownload />}
          {downloadType === 'android' && <GooglePlayDownload />}
          {downloadType === null && (
            <div className="flex gap-x-6">
              <AppStoreDownload />
              <GooglePlayDownload />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppDownload;

const AppStoreDownload = () => {
  return (
    <Link
      href={AppStoreLink}
      target="_blank"
      className="flex h-11 items-center gap-x-1 rounded-lg border border-white/40 bg-white/10 pr-5 pl-4 text-gray-300"
    >
      <div className="flex size-8 items-center justify-center">
        <Image src="/icons/apple.svg" alt="apple" unoptimized width={20} height={26} />
      </div>
      App Store
    </Link>
  );
};

const GooglePlayDownload = () => {
  return (
    <Link
      href={GooglePlayLink}
      target="_blank"
      className="flex h-11 items-center gap-x-1 rounded-lg border border-white/40 bg-white/10 pr-5 pl-4 text-gray-300"
    >
      <Image src="/icons/google-play.png" alt="google" className="size-8" width={32} height={32} />
      Google Play
    </Link>
  );
};
