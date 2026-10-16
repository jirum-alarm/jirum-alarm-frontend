// 하단 고정 「구매하러 가기」가 실제 화면 안에 보이는지 한 번 재서 GA4 로(dataLayer `cta_visibility`).
//
// ★왜(2026-10-16): 삼성 인터넷 30.0(삼성 트래픽의 98%) 상세 착지 구매 클릭률이 9/10~11 사이 31%→9% 로 계단처럼
// 떨어졌다. 유입·경로·도시 어디로 쪼개도 같고, 다른 버튼(카톡 배너·카드)은 크롬보다 더 누른다 → 구매 버튼에 손이
// 안 닿는 모양이다. 유력 후보는 브라우저 하단 툴바가 고정 바를 덮는 것, 또는 가로 넘침으로 고정 바가 밀리는 것.
// 실기기가 없어 재현을 못 하니 사용자 화면에서 직접 잰다.
//
// ★첫 판독(10/16 오전 1시간): 삼성 인터넷만 버튼 크기 0(그려지지 않음)이 24%(10/41), 다른 브라우저는 0/339.
// 가려진 게 아니라 숨겨진 것 — 떠 있는 요소 + rel=sponsored 링크를 광고로 보고 숨기는 동작으로 본다
// (Samsung 특허 2026-10-15 공개: 행동 기반 광고 숨김, 신호에 sponsored 링크). 그래서 not_rendered 를 따로 센다.

export type CtaVisibility = 'full' | 'partial' | 'hidden' | 'not_rendered';

export type CtaViewport = {
  rectWidth: number;
  rectHeight: number;
  rectTop: number;
  rectBottom: number;
  viewportTop: number;
  viewportHeight: number;
};

export const ctaVisibilityOf = ({
  rectWidth,
  rectHeight,
  rectTop,
  rectBottom,
  viewportTop,
  viewportHeight,
}: CtaViewport): CtaVisibility => {
  if (rectWidth === 0 && rectHeight === 0) return 'not_rendered';
  const viewportBottom = viewportTop + viewportHeight;
  if (rectBottom <= viewportBottom + 1 && rectTop >= viewportTop - 1) return 'full';
  if (rectTop < viewportBottom) return 'partial';
  return 'hidden';
};

export const reportCtaVisibility = (el: HTMLElement): CtaVisibility => {
  const vv = window.visualViewport;
  const rect = el.getBoundingClientRect();
  const visibility = ctaVisibilityOf({
    rectWidth: rect.width,
    rectHeight: rect.height,
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
  return visibility;
};
