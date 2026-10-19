/**
 * 「앱 열기」 뒤 다른 앱으로 넘어갔다가 돌아왔는지 본다.
 *
 * 카톡 iPhone 인앱 브라우저는 다른 앱이 열려도 visibilitychange 를 안 보낸다(10/15 실기기 — 앱은 열렸는데 돌아와도
 * 「다음부터 바로 열까요?」가 안 떴다). 그래서 이벤트(visibilitychange·pagehide·blur) 말고 «타이머가 멈췄다 깨어났나»도
 * 본다 — iOS 는 앱이 뒤로 가면 웹 JS 를 멈추므로, 짧은 간격 틱 사이가 크게 벌어졌으면 떠났다 돌아온 것이다.
 *
 * - onReturn: 떠났다가 돌아왔다(앱이 열렸다). 한 번만.
 * - onStay: windowMs 동안 떠나지 않았다(앱이 안 열렸다·막혔다).
 * 돌려주는 함수로 정리한다. 떠난 뒤 돌아오지 않으면 10분 뒤 스스로 정리한다.
 */
const TICK_MS = 250;
const GAP_MS = 1500;
const GIVE_UP_MS = 10 * 60_000;

export function watchAppSwitch({
  windowMs,
  onReturn,
  onStay,
}: {
  windowMs: number;
  onReturn: () => void;
  onStay?: () => void;
}): () => void {
  const start = Date.now();
  let last = start;
  let left = false;
  let done = false;

  const finish = (fn?: () => void) => {
    if (done) return;
    done = true;
    cleanup();
    fn?.();
  };
  const onHide = () => {
    left = true;
  };
  const onShow = () => {
    if (left && document.visibilityState !== 'hidden') finish(onReturn);
  };
  const onVisibility = () => (document.visibilityState === 'hidden' ? onHide() : onShow());

  const tick = window.setInterval(() => {
    const now = Date.now();
    // 멈췄다 깨어났다 = 떠났다가 지금 돌아와 있다.
    if (now - last > GAP_MS) {
      left = true;
      finish(onReturn);
      return;
    }
    last = now;
    if (!left && now - start >= windowMs) finish(onStay);
    if (now - start >= GIVE_UP_MS) finish();
  }, TICK_MS);

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onHide);
  window.addEventListener('blur', onHide);
  window.addEventListener('pageshow', onShow);
  window.addEventListener('focus', onShow);

  function cleanup() {
    window.clearInterval(tick);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onHide);
    window.removeEventListener('blur', onHide);
    window.removeEventListener('pageshow', onShow);
    window.removeEventListener('focus', onShow);
  }
  return () => finish();
}

/** 타이머 콜백이 예정보다 이만큼 늦게 돌았으면 그 사이 페이지가 멈춰 있었다(다른 앱이 앞에 있었다). */
export const wasSuspended = (startedAt: number, expectedMs: number): boolean =>
  Date.now() - startedAt > expectedMs + GAP_MS;
