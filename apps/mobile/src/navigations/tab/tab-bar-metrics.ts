import {Platform} from 'react-native';
import {isLiquidGlassAvailable} from 'expo-glass-effect';

/**
 * 탭바 치수. MainTabNavigator 에서 떼어낸 이유는 순환 참조 때문이다.
 *
 * MainTabNavigator → TabStackNavigator → TabWebView → (getReservedBottomPx) →
 * MainTabNavigator 로 고리가 생겨 Metro 가 "Require cycle" 경고를 냈고,
 * 순환 안의 모듈이 초기화 전 값(undefined)으로 읽힐 수 있어 화면이 멈췄다.
 */
export const TAB_BAR_HEIGHT = 64;
export const GLASS_BOTTOM_GAP = 12;
export const GLASS_SIDE_INSET = 16;
/** JS 탭바(안드로이드·iOS 25 이하). MainTabNavigator 높이 공식과 짝. */
export const JS_TAB_BAR_HEIGHT = 56;
export const JS_TAB_BAR_FALLBACK_INSET = 8;
/** iOS 시스템 UITabBar 콘텐츠 높이 (home indicator 제외). */
export const SYSTEM_TAB_BAR_HEIGHT = 49;

/** iOS 26 시스템 UITabBar (리퀴드 글라스 오버레이). */
export function isIos26SystemTabBar(): boolean {
  return (
    Platform.OS === 'ios' && Number.parseFloat(String(Platform.Version)) >= 26
  );
}

/**
 * 네이티브 탭바를 display:none 으로 숨길 때 화면 하단을 잘라내는 높이.
 * createNativeBottomTabNavigator 와 숨기는 화면의 padding 이 같은 값을 써야
 * CTA·입력창이 같이 잘리지 않는다.
 */
export function getTabBarClipPx(safeAreaBottom: number): number {
  return TAB_BAR_HEIGHT + Math.max(safeAreaBottom, 12);
}

function jsTabBarOverlayPx(safeAreaBottom: number): number {
  return (
    JS_TAB_BAR_HEIGHT +
    (safeAreaBottom > 0 ? safeAreaBottom : JS_TAB_BAR_FALLBACK_INSET)
  );
}

/**
 * 웹·CTA 가 확보해야 할 하단 여백.
 *
 * iOS 26 시스템 탭바는 화면 위에 떠서 웹이 풀스크린이다. 가리는 높이는
 * 시스템 탭바(49) + home indicator.
 *
 * JS 탭바(안드로이드·구 iOS)도 absolute 오버레이라 56 + inset 을 비운다.
 * 0 으로 두면 마지막 글·글쓰기 버튼이 탭바 밑으로 들어간다.
 *
 * 커스텀 리퀴드 글라스 캡슐만 높이+바닥 간격+여유를 쓴다.
 */
export function getReservedBottomPx(safeAreaBottom: number): number {
  const bottomGap = safeAreaBottom > 0 ? safeAreaBottom : GLASS_BOTTOM_GAP;
  if (isIos26SystemTabBar()) {
    return SYSTEM_TAB_BAR_HEIGHT + bottomGap;
  }
  if (isLiquidGlassAvailable()) {
    return TAB_BAR_HEIGHT + bottomGap + GLASS_BOTTOM_GAP;
  }
  return jsTabBarOverlayPx(safeAreaBottom);
}

/**
 * 글쓰기 FAB 이 붙는 높이. 목록 여백(reserved)과 따로 둔다.
 * iOS 26 은 캡슐만(safe-area 를 다시 넣으면 버튼이 뜬다).
 * JS 탭바는 탭바 높이 그대로 — 0 이면 글쓰기 버튼이 탭바와 겹친다.
 */
export function getFabPaddingPx(safeAreaBottom: number): number {
  if (isIos26SystemTabBar()) {
    return SYSTEM_TAB_BAR_HEIGHT + GLASS_BOTTOM_GAP;
  }
  if (isLiquidGlassAvailable()) {
    return TAB_BAR_HEIGHT + GLASS_BOTTOM_GAP;
  }
  return jsTabBarOverlayPx(safeAreaBottom);
}

/**
 * 웹 `--bottom-nav-padding` / `--bottom-chrome-padding` / FAB 짝.
 *
 * 탭바 보임: padding = 오버레이 탭바 높이. chrome = 0.75rem.
 *   FAB 는 캡슐 높이만 (safe-area 를 다시 넣지 않음).
 * 탭바 숨김: padding = 0, chrome 이 home indicator 를 맡는다.
 *   (웹뷰 안 SPA 는 화면을 자르지 않는다. clip 높이만큼 올리면
 *    댓글 입력창 아래에 빈 칸이 생긴다.)
 */
export function getWebBottomNavVars({
  tabBarVisible,
  reservedBottomPx,
  safeAreaBottom,
  fabPaddingPx,
}: {
  tabBarVisible: boolean;
  reservedBottomPx: number;
  safeAreaBottom: number;
  fabPaddingPx: number;
}): {
  paddingPx: number;
  chromePadding: string;
  fabPaddingPx: number;
  fabGap: string;
} {
  if (tabBarVisible) {
    return {
      paddingPx: reservedBottomPx,
      chromePadding: '0.75rem',
      fabPaddingPx,
      fabGap: fabPaddingPx > 0 ? '8px' : '1rem',
    };
  }
  return {
    paddingPx: 0,
    chromePadding: `${Math.max(12, safeAreaBottom)}px`,
    fabPaddingPx: 0,
    fabGap: '1rem',
  };
}

export function buildNativeTabsCss(vars: {
  paddingPx: number;
  chromePadding: string;
  fabPaddingPx: number;
  fabGap: string;
}): string {
  return (
    '[data-native-tabs="true"] nav { display: none !important; }' +
    '[data-native-tabs="true"] [data-bottom-nav] { display: none !important; }' +
    `:root { --bottom-nav-padding: ${vars.paddingPx}px !important; --bottom-chrome-padding: ${vars.chromePadding} !important; --bottom-fab-padding: ${vars.fabPaddingPx}px !important; --bottom-fab-gap: ${vars.fabGap} !important; }`
  );
}

/** 스타일이 이미 있어도 값을 갱신한다. SPA 로 탭 루트↔하위 이동 때 필수. */
export function buildNativeTabsInjectJs(vars: {
  paddingPx: number;
  chromePadding: string;
  fabPaddingPx: number;
  fabGap: string;
}): string {
  const css = buildNativeTabsCss(vars);
  return `
  (function() {
    var STYLE_ID = 'jirum-native-tabs';
    document.documentElement.dataset.nativeTabs = 'true';
    var style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      (document.head || document.documentElement).appendChild(style);
    }
    style.textContent = ${JSON.stringify(css)};
  })();
  true;
`;
}
