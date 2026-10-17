// 클릭 순간의 분석 이벤트를 클릭 처리가 끝난 다음 태스크로 미뤄 dataLayer 에 넣는다.
//
// ★왜(2026-10-17): dataLayer.push 는 GTM 이 그 자리에서 GA4 등 태그를 동기로 돌린다. 구매 링크(target=_blank)는
// 클릭 핸들러가 전부 끝나야 새 창을 연다(링크 기본 동작). 실사용 RUM(web_vitals)에서 상세 구매 버튼 탭의 처리 구간이
// 평균 ~350ms(네이버 앱 인앱)였고, 4배 저속 실측으로 그 절반 가까이가 이 push 였다 — 미루면 쇼핑몰 창이 그만큼 먼저 뜬다.
// requestAnimationFrame 은 쓰지 않는다: 새 창이 뜨면 이 페이지가 숨고, 숨은 페이지는 rAF 가 돌지 않아 기록이 빠진다.
// 타이머도 숨은 웹뷰에선 멈출 수 있어, 그 전에 페이지가 숨으면 숨는 순간 바로 넣는다 — 구매 클릭 기록은 빠지면 안 된다.
export const pushDataLayerSoon = (event: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  let sent = false;
  const send = () => {
    if (sent) return;
    sent = true;
    window.clearTimeout(timer);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', send);
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push(event);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') send();
  };
  const timer = window.setTimeout(send, 0);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', send);
};
