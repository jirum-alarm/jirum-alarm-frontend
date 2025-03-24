'use client';

import { useEffect } from 'react';

export function Analytics({ GA_TRACKING_ID }: { GA_TRACKING_ID: string }) {
  useEffect(() => {
    // GA 스크립트 비동기 로드
    const loadGA = async () => {
      const { default: GoogleAnalytics } = await import('./GoogleAnalitics');
      GoogleAnalytics({ GA_TRACKING_ID });
    };

    // Mixpanel 스크립트 비동기 로드
    const loadMixpanel = async () => {
      const { InitMixpanel } = await import('@/lib/mixpanel');
      InitMixpanel();
    };

    // requestIdleCallback으로 브라우저 유휴 시간에 로드
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        loadGA();
        loadMixpanel();
      });
    } else {
      // requestIdleCallback을 지원하지 않는 브라우저를 위한 폴백
      setTimeout(() => {
        loadGA();
        loadMixpanel();
      }, 1000); // 1초 후 로드
    }
  }, [GA_TRACKING_ID]);

  return null;
}
