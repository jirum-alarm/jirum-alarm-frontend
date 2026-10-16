// 하단 고정 「구매하러 가기」가 실제 화면 안에 보이는지 한 번 재서 GA4 로(dataLayer `cta_visibility`).
//
// ★왜(2026-10-16): 삼성 인터넷 30.0(삼성 트래픽의 98%) 상세 착지 구매 클릭률이 9/10~11 사이 31%→9% 로 계단처럼
// 떨어졌다. 유입·경로·도시 어디로 쪼개도 같고, 다른 버튼(카톡 배너·카드)은 크롬보다 더 누른다 → 구매 버튼에 손이
// 안 닿는 모양이다. 유력 후보는 브라우저 하단 툴바가 고정 바를 덮는 것, 또는 가로 넘침으로 고정 바가 밀리는 것.
// 실기기가 없어 재현을 못 하니 사용자 화면에서 직접 잰다. 판정이 나면 이 계측은 지운다.

export type CtaVisibility = 'full' | 'partial' | 'hidden';

export type CtaViewport = {
  rectTop: number;
  rectBottom: number;
  viewportTop: number;
  viewportHeight: number;
};

export const ctaVisibilityOf = ({
  rectTop,
  rectBottom,
  viewportTop,
  viewportHeight,
}: CtaViewport): CtaVisibility => {
  const viewportBottom = viewportTop + viewportHeight;
  if (rectBottom <= viewportBottom + 1 && rectTop >= viewportTop - 1) return 'full';
  if (rectTop < viewportBottom) return 'partial';
  return 'hidden';
};

export const reportCtaVisibility = (el: HTMLElement) => {
  const vv = window.visualViewport;
  const rect = el.getBoundingClientRect();
  const visibility = ctaVisibilityOf({
    rectTop: rect.top,
    rectBottom: rect.bottom,
    viewportTop: vv?.offsetTop ?? 0,
    viewportHeight: vv?.height ?? window.innerHeight,
  });
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event: 'cta_visibility',
    cta_visibility: visibility,
    // 원인 가르기용: 툴바가 덮으면 inner 와 visual 높이 차·rect 위치, 가로 넘침이면 scrollWidth > innerWidth.
    cta_geometry: [
      `r${Math.round(rect.top)}-${Math.round(rect.bottom)}`,
      `ih${window.innerHeight}`,
      `vh${Math.round(vv?.height ?? -1)}`,
      `vs${(vv?.scale ?? 1).toFixed(2)}`,
      `iw${window.innerWidth}`,
      `sw${document.documentElement.scrollWidth}`,
    ].join(' '),
  });
};
