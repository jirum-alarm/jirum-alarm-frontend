/**
 * 다음 화면의 입력창이 모바일 키보드를 띄우게 한다 — 반드시 사용자 탭 핸들러 안에서 동기로 부를 것.
 *
 * iOS 사파리(안드로이드 크롬도 일부)는 사용자 제스처 밖의 `focus()` 로는 키보드를 올리지 않는다.
 * 라우트 이동 뒤 입력창의 focus 는 이미 제스처 밖이라 커서만 잡히고 키보드가 안 뜬다.
 * 그래서 탭 순간 임시 input 에 먼저 포커스해 키보드를 올려 두고, 다음 화면이 포커스를 넘겨받으면 치운다.
 */
export function summonKeyboard() {
  const el = document.createElement('input');
  el.setAttribute('aria-hidden', 'true');
  el.tabIndex = -1;
  // 16px 미만이면 iOS 가 화면을 확대하고, 화면 밖에 두면 그쪽으로 스크롤한다.
  el.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;font-size:16px;';
  document.body.appendChild(el);
  el.focus();
  el.addEventListener('blur', () => el.remove(), { once: true });
  // ponytail: 화면 전환이 3초를 넘기면 키보드가 내려간다(입력창 포커스는 그대로 잡힘).
  setTimeout(() => el.remove(), 3000);
}
