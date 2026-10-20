'use client';

import { useEffect } from 'react';

import { IS_PRD } from '@/shared/config/env';
import { installUxSignals } from '@/shared/lib/ux-signals-client';

// 요소 단위 dead·rage 클릭과 페이지별 웹 바이탈 → /api/ux-signal → 웹 서버 로그(Loki). 이유는 shared/lib/ux-signals.ts.
// WebVitalsReporter 보다 먼저 둔다 — 같은 커밋 단계에서 형제 effect 는 순서대로 돌아, 바이탈이 오기 전에 켜져 있어야 한다.
export const UxSignalsReporter = () => {
  useEffect(() => {
    if (IS_PRD) installUxSignals();
  }, []);
  return null;
};
