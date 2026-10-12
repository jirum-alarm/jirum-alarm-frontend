import {tabStackNavigations} from '@/shared/constant/navigations';

type NavState = {
  index?: number;
  routes: {name: string; key?: string; state?: NavState}[];
};

/**
 * 지금 보이는 화면 이름(GA4 screen_name). 중첩 네비게이터를 끝까지 따라간다.
 *
 * ★탭 안 첫 화면은 다섯 탭 모두 이름이 `TabRoot` 라 그대로 보내면 홈·발견·알림이
 * 한 화면으로 뭉친다 — 그때만 바깥 탭 이름(HomeTab 등)을 쓴다.
 */
export function focusedScreenName(state?: NavState): string | undefined {
  return focusedScreen(state)?.name;
}

/**
 * 지금 보이는 화면의 이름과 **그 화면 인스턴스의 key**.
 *
 * ★중복 판정은 key 로 한다 — 이름으로 하면 상세 → (관련 상품) → 상세처럼 같은 이름 화면을 push 할 때
 * 두 번째 상세의 screen_view 가 통째로 빠졌다(상세 조회 깔때기·Sentry screen 태그가 첫 상세에 멈춤).
 * 같은 화면 안 params 변화(탭 재선택 등)는 key 가 그대로라 여전히 한 번만 센다.
 */
export function focusedScreen(
  state?: NavState,
): {name: string; key: string} | undefined {
  let name: string | undefined;
  let parent: string | undefined;
  let key: string | undefined;
  let current = state;
  while (current?.routes?.length) {
    const route = current.routes[current.index ?? current.routes.length - 1];
    parent = name;
    name = route.name;
    key = route.key ?? route.name;
    current = route.state;
  }
  if (!name || !key) return undefined;
  return {name: name === tabStackNavigations.ROOT ? parent ?? name : name, key};
}

/**
 * 네비게이션 상태가 바뀔 때마다 부르면, 화면 인스턴스가 바뀐 때만 report 한다(GA4 screen_view·Sentry 태그).
 */
export function createScreenTracker(report: (name: string) => void) {
  let lastKey: string | undefined;
  return (state?: NavState) => {
    const screen = focusedScreen(state);
    if (!screen || screen.key === lastKey) return;
    lastKey = screen.key;
    report(screen.name);
  };
}
