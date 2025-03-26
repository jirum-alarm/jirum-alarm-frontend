'use client';

import { GoogleTagManager } from '@next/third-parties/google';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { GTM_ID } from '@/constants/gtm';

export default function GTM() {
  const pathname = usePathname();

  useEffect(() => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: pathname,
    });
  }, [pathname]); // pathname이 변경될 때 실행

  return <GoogleTagManager gtmId={GTM_ID} />;
}
