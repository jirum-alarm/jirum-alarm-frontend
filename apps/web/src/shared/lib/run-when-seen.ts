/**
 * 페이지가 실제로 보이는 채로 `settleMs` 를 버티면 `onSeen` 을 한 번 부른다. 돌려주는 함수로 취소.
 *
 * 왜: 구매 후 권유는 구매 링크(target=_blank)를 누른 순간 뜨는데, 그 직후 쇼핑몰 창이 앞으로 와서 이 페이지는 숨는다.
 * 뜨자마자 노출을 세면 아무도 못 본 노출이 쌓여(오카방 권유는 노출에 비해 클릭이 극소수였다) 클릭률을
 * 믿을 수 없다. 렌더 직후엔 아직 visible 이라 visibilityState 만 보면 못 거른다 — 잠깐 버티는지까지 본다.
 * 숨었다가 돌아오면 그때 다시 잰다. 돌아오지 않고 페이지가 내려가면 끝내 세지 않는다.
 */
export function runWhenSeen(onSeen: () => void, settleMs = 1000): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const check = () => {
    clearTimeout(timer);
    if (document.visibilityState !== 'visible') return;
    timer = setTimeout(() => {
      if (document.visibilityState !== 'visible') return;
      document.removeEventListener('visibilitychange', check);
      onSeen();
    }, settleMs);
  };
  document.addEventListener('visibilitychange', check);
  check();
  return () => {
    clearTimeout(timer);
    document.removeEventListener('visibilitychange', check);
  };
}
