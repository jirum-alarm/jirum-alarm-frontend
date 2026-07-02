'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { env } from 'next-runtime-env';

import { IS_PRD } from '@/shared/config/env';

export const AdSenseProvider = () => {
  const pathname = usePathname();
  const clientId = env('NEXT_PUBLIC_ADSENSE_CLIENT_ID') ?? '';
  const isPromotionPath = pathname.startsWith('/promotion');

  if (!IS_PRD || !clientId || isPromotionPath) {
    return null;
  }

  return (
    <Script
      id="adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
