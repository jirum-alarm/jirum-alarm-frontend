import {tabStackNavigations} from '@/shared/constant/navigations';

type NavState = {
  index?: number;
  routes: {name: string; state?: NavState}[];
};

/**
 * 지금 보이는 화면 이름(GA4 screen_name). 중첩 네비게이터를 끝까지 따라간다.
 *
 * ★탭 안 첫 화면은 다섯 탭 모두 이름이 `TabRoot` 라 그대로 보내면 홈·발견·알림이
 * 한 화면으로 뭉친다 — 그때만 바깥 탭 이름(HomeTab 등)을 쓴다.
 */
export function focusedScreenName(state?: NavState): string | undefined {
  let name: string | undefined;
  let parent: string | undefined;
  let current = state;
  while (current?.routes?.length) {
    const route = current.routes[current.index ?? current.routes.length - 1];
    parent = name;
    name = route.name;
    current = route.state;
  }
  return name === tabStackNavigations.ROOT ? parent : name;
}
