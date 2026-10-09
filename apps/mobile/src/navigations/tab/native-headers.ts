import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

import {useColors} from '@/shared/theme/useColors';

/**
 * className 이 안 먹는 크롬(헤더 tint·탭바·스택 contentStyle)의 색. **여기 한 곳이 정본이다** —
 * 화면별로 흩어 두면 다크모드에서 한 곳만 흰색으로 남는다.
 * 값은 디자인 토큰(@jirum/design-system)에서 오고 OS 다크모드를 따라 바뀐다(그래서 상수가 아니라 훅).
 */
export function useChromeColors() {
  const c = useColors();
  return {
    headerTint: c.gray[900],
    headerBackground: c.white,
    headerBorder: c.gray[100],
    /**
     * 하단 탭바 표면색. ⚠️**JS 탭바(`MainTabNavigator`)와 네이티브 탭바
     * (`createNativeBottomTabNavigator`) 두 벌이 같은 값을 써야 한다** — 어긋나면
     * 탭바만 다른 색으로 갈린다.
     */
    tabBarBackground: c.white,
    tabBarBorder: c.gray[300],
    tabBarActiveTint: c.gray[900],
    tabBarInactiveTint: c.gray[500],
    /**
     * 화면 본문 바탕 — 네이티브 스택 `contentStyle` 과 WebView 로딩 오버레이가 쓴다.
     * 이걸 안 주면 화면 전환 애니메이션 동안, 그리고 아직 아무것도 안 그린 WebView
     * 위로 시스템 기본 배경이 그대로 보인다(흰 화면의 정체).
     */
    screenBackground: c.white,
  };
}

/**
 * 모든 헤더가 공유하는 옵션. 개별 옵션은 이걸 펼치고 title 만 덧붙인다.
 * 색은 없다 — 헤더는 전부 AppStackHeader(JS)가 그리고, 거기서 useChromeColors 를 쓴다.
 */
export const baseHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerBackButtonDisplayMode: 'minimal',
};

/** 상품 상세 — 시스템 UINavigationBar. 타이틀·검색·공유는 화면이 setOptions 로 채운다. */
export const productDetailHeaderOptions: NativeStackNavigationOptions = {
  ...baseHeaderOptions,
  headerTitleAlign: 'left',
  title: '',
};

/** 댓글 — 시스템 헤더. */
export const commentsHeaderOptions: NativeStackNavigationOptions = {
  ...baseHeaderOptions,
  title: '댓글',
};
