'use client';

import { useEffect } from 'react';

import { IS_PRD } from '@/shared/config/env';
import { toWebVitalsEvent } from '@/shared/lib/web-vitals-report';

// 실사용자 LCP·INP·CLS·TTFB → dataLayer(GTM 이 GA4 web_vitals 로 보낸다). 이유는 web-vitals-report.ts.
// 라이브러리는 하이드레이션 뒤에 받는다 — 관찰자는 buffered 라 늦게 붙어도 첫 화면 값을 놓치지 않는다.
// INP·CLS 는 화면을 떠날 때 확정되므로 그때 경로가 아니라 처음 들어온(하드 로드) 경로로 묶는다.
export const WebVitalsReporter = () => {
  useEffect(() => {
    if (!IS_PRD) return;
    const landingPath = window.location.pathname;
    const push = (event: ReturnType<typeof toWebVitalsEvent>) =>
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push(event);
    import('web-vitals/attribution').then(({ onCLS, onINP, onLCP, onTTFB }) => {
      onLCP((m) => push(toWebVitalsEvent(m, landingPath)));
      onINP((m) => push(toWebVitalsEvent(m, landingPath)));
      onCLS((m) => push(toWebVitalsEvent(m, landingPath)));
      onTTFB((m) => push(toWebVitalsEvent(m, landingPath)));
    });
  }, []);
  return null;
};
