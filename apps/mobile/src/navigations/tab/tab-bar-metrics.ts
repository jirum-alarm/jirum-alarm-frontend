import {isLiquidGlassAvailable} from 'expo-glass-effect';

/**
 * 탭바 치수. MainTabNavigator 에서 떼어낸 이유는 순환 참조 때문이다.
 *
 * MainTabNavigator → TabStackNavigator → TabWebView → (getReservedBottomPx) →
 * MainTabNavigator 로 고리가 생겨 Metro 가 "Require cycle" 경고를 냈고,
 * 순환 안의 모듈이 초기화 전 값(undefined)으로 읽힐 수 있어 화면이 멈췄다.
 * 치수 계산은 화면에 의존하지 않으므로 여기로 옮긴다.
 */
export const TAB_BAR_HEIGHT = 64;
export const GLASS_BOTTOM_GAP = 12;

/** 웹이 확보해야 할 하단 여백(네이티브 탭바가 덮는 높이). */
export function getReservedBottomPx(safeAreaBottom: number): number {
  if (!isLiquidGlassAvailable()) {
    return 56 + (safeAreaBottom > 0 ? safeAreaBottom : 8);
  }
  return (
    TAB_BAR_HEIGHT +
    (safeAreaBottom > 0 ? safeAreaBottom : GLASS_BOTTOM_GAP) +
    GLASS_BOTTOM_GAP
  );
}
