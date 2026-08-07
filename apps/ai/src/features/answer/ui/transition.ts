/**
 * 홈 → 대화방 전환을 브라우저 View Transitions 로 애니메이션한다.
 * URL 은 그대로 바뀌고(진짜 라우팅), 화면만 페이지 교체가 아니라
 * "입력창이 하단으로 내려앉고 채팅이 펼쳐지는" 모습으로 보인다.
 *
 * 원리: 양쪽 페이지의 입력창에 같은 `view-transition-name`(globals.css) 이
 * 걸려 있어 브라우저가 두 위치 사이를 morph 한다. 나머지는 크로스페이드.
 *
 * ★App Router 의 `router.push` 는 비동기라 콜백이 끝나도 새 화면이 아직 없다.
 * 그대로 넘기면 스냅샷만 찍고 즉시 종료 — 모션이 아니라 깜빡임이 된다.
 * 그래서 DOM 이 실제로 바뀔 때까지 transition 을 붙잡는다.
 */
export function startRoomTransition(navigate: () => void, cleanup?: () => void) {
  const skip = () => {
    navigate();
    cleanup?.();
  };
  // 미지원(Safari 구버전 등) 이면 그냥 즉시 전환 — 폴리필 안 넣는다
  if (typeof document === 'undefined' || !document.startViewTransition) return skip();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return skip();

  const t = document.startViewTransition(async () => {
    navigate();
    // ponytail: 새 페이지의 입력창이 붙을 때까지 대기. 라우터 완료 이벤트가
    // 없어 DOM 관찰이 가장 싼 신호다. 300ms 는 상한(느린 네트워크면 모션 포기).
    await waitFor(() => !!document.querySelector('[data-room-composer]'), 300);
  });
  // 성공이든 실패든 임시로 붙인 view-transition-name 은 반드시 걷어낸다
  if (cleanup) t.finished.finally(cleanup);
}

/** `check` 가 true 가 되거나 timeout 이 지나면 resolve. 둘 다 정상 종료. */
function waitFor(check: () => boolean, timeoutMs: number) {
  return new Promise<void>((resolve) => {
    if (check()) return resolve();
    const done = () => {
      observer.disconnect();
      clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => check() && done());
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = setTimeout(done, timeoutMs);
  });
}
