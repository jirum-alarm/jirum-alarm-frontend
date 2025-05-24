'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useDevice } from '@/hooks/useDevice';

const GooglePlayLink = 'https://play.google.com/store/apps/details?id=com.solcode.jirmalam';
const AppStoreLink =
  'https://apps.apple.com/sg/app/%EC%A7%80%EB%A6%84%EC%95%8C%EB%A6%BC/id6474611420';

const useAppDownloadLink = () => {
  const { isApple, isAndroid } = useDevice();

  if (isApple) {
    return { type: 'apple', link: AppStoreLink } as const;
  }
  if (isAndroid) {
    return { type: 'android', link: GooglePlayLink } as const;
  }

  return { type: null, link: null } as const;
};

const AppDownload = () => {
  const { link } = useAppDownloadLink();
  return (
    <div className="pt-6 lg:pt-8">
      <div className="hidden gap-x-6 lg:flex">
        <Link
          href={AppStoreLink ?? '#'}
          className="flex items-center gap-x-3.75 rounded-lg border border-white/40 bg-white/10 px-3.75 py-2.25 text-gray-300"
        >
          <div className="flex size-8 items-center justify-center">
            <Image src="/icons/apple.svg" alt="apple" unoptimized width={20} height={26} />
          </div>
          App Store
        </Link>
        <Link
          href={GooglePlayLink ?? '#'}
          className="flex items-center gap-x-3.75 rounded-lg border border-white/40 bg-white/10 px-3.75 py-2.25 text-gray-300"
        >
          <Image
            src="/icons/google-play.png"
            alt="google"
            className="size-8"
            width={32}
            height={32}
          />
          Google Play
        </Link>
      </div>
      <Link
        href={link ?? '#'}
        className="mt-5 w-full rounded-full border border-white/40 bg-white/10 px-8.75 py-3 text-center text-lg leading-none font-bold text-gray-300 lg:hidden"
      >
        앱 다운로드
      </Link>
    </div>
  );
};

export default AppDownload;
