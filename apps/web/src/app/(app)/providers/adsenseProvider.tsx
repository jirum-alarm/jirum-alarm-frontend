'use client';

import Script from 'next/script';
import { env } from 'next-runtime-env';

import { IS_PRD } from '@/shared/config/env';

export const AdSenseProvider = () => {
  const clientId = env('NEXT_PUBLIC_ADSENSE_CLIENT_ID') ?? '';

  if (!IS_PRD || !clientId) {
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
