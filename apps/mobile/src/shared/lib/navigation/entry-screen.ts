// 상세 진입 직전 화면 — 구매 클릭이 어느 노출(홈·검색·알림…)에서 왔는지 가르는 용도(2026-10-05).
// 웹 apps/web/src/shared/lib/entry.ts 와 같은 목적. 값은 서버 user_history.detail 로 들어간다.

type NavState = {index: number; routes: {name: string}[]} | undefined;

/** 같은 스택의 이전 스크린, 스택 첫 화면이면(푸시·딥링크 진입) 부모(탭)의 현재 화면. */
export function resolveEntryScreen(
  stack: NavState,
  parent: NavState,
): string | undefined {
  const prev = stack?.routes[stack.index - 1];
  if (prev) return `screen:${prev.name}`;
  const tab = parent?.routes[parent.index];
  return tab ? `root:${tab.name}` : undefined;
}
