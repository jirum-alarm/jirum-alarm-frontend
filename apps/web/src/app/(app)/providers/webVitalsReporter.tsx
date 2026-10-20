'use client';

import { useEffect } from 'react';

import { IS_PRD } from '@/shared/config/env';
import { recordUxVital } from '@/shared/lib/ux-signals-client';
import { toWebVitalsEvent } from '@/shared/lib/web-vitals-report';

// 실사용자 LCP·INP·CLS·TTFB → dataLayer(GTM 이 GA4 web_vitals 로 보낸다). 이유는 web-vitals-report.ts.
// 라이브러리는 하이드레이션 뒤에 받는다 — 관찰자는 buffered 라 늦게 붙어도 첫 화면 값을 놓치지 않는다.
// INP·CLS 는 화면을 떠날 때 확정되므로 그때 경로가 아니라 처음 들어온(하드 로드) 경로로 묶는다.
// 같은 값을 우리 서버 로그(/api/ux-signal → Loki)에도 남긴다 — GA4 를 거치지 않고 페이지별로 바로 본다(FCP 는 여기만).
export const WebVitalsReporter = () => {
  useEffect(() => {
    if (!IS_PRD) return;
    const landingPath = window.location.pathname;
    const report = (metric: Parameters<typeof toWebVitalsEvent>[0]) => {
      const event = toWebVitalsEvent(metric, landingPath);
      (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push(event);
      recordUxVital(metric, landingPath, event.vitals_target);
    };
    import('web-vitals/attribution').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
      onLCP(report);
      onINP(report);
      onCLS(report);
      onTTFB(report);
      onFCP((m) => recordUxVital(m, landingPath));
    });
  }, []);
  return null;
};
