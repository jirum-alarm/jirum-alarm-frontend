'use client';

import { useEffect } from 'react';

// dataLayer(GTM) push — 프로젝트 전 이벤트가 이 경로 (FirstVisitAppAlertModal 패턴).
// ★GTM 컨테이너에 이벤트를 등록해야 Mixpanel 에 도달함 — 배선만으로는 미도달 (2026-07-08 실증).
function pushEvent(event: string, props: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    ...props,
  });
}

/**
 * /deals 판별 스프린트 계측 (2026-07-08 설계 — 검색유입 cohort 프록시 판정용).
 * - deals_landing: 랜딩 시 1회. referrer_host 가 cohort 구분자(naver/google=검색, ''=direct).
 *   SPA 내부 이동에 덮이지 않게 mount 시점에 캡처.
 * - deals_outbound_click: 외부(다나와 등)로 나가는 클릭 — 수익 프록시 지표의 분자.
 * - deals_deal_click: 내부 핫딜 상세(/products/*)로 가는 클릭.
 * 서버 컴포넌트 페이지라 링크 각각을 클라이언트화하지 않고 이벤트 위임 1개로 처리.
 * screen_width: 봇 필터용(1600 고정 = 봇 — 2026-06-19 실측).
 */
export default function DealsTracking({ slug }: { slug: string }) {
  useEffect(() => {
    let referrerHost = 'direct';
    try {
      if (document.referrer) referrerHost = new URL(document.referrer).hostname;
    } catch {
      referrerHost = 'unknown';
    }
    const base = { slug, referrer_host: referrerHost, screen_width: window.innerWidth };
    pushEvent('deals_landing', base);

    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest?.('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const href = anchor.getAttribute('href') ?? '';
      if (href.startsWith('/products/')) {
        pushEvent('deals_deal_click', { ...base, href });
      } else if (/^https?:\/\//.test(href) && !href.includes('jirum-alarm.com')) {
        pushEvent('deals_outbound_click', { ...base, href });
      }
    };
    // capture: 링크 내비게이션(특히 _blank 아닌 내부 이동)보다 먼저 잡음.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, [slug]);

  return null;
}
