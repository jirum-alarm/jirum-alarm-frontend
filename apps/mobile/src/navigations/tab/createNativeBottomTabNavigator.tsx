import React from 'react';
import {StyleSheet, View} from 'react-native';
import {
  CommonActions,
  createNavigatorFactory,
  TabRouter,
  useNavigationBuilder,
  type DefaultNavigatorOptions,
  type ParamListBase,
  type TabActionHelpers,
  type TabNavigationState,
  type TabRouterOptions,
} from '@react-navigation/native';
import {Lazy, SafeAreaProviderCompat} from '@react-navigation/elements';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Tabs,
  type PlatformIconAndroid,
  type PlatformIconIOS,
  type TabSelectedEvent,
  type TabSelectionRejectedEvent,
  type TabsScreenAppearanceIOS,
} from 'react-native-screens';
import type {
  ColorValue,
  ImageSourcePropType,
  NativeSyntheticEvent,
} from 'react-native';

import {getTabBarClipPx} from './tab-bar-metrics';
import {useChromeColors} from './native-headers';

export type NativeTabIcon =
  | {type: 'sfSymbol'; name: string}
  | {type: 'image'; source: ImageSourcePropType; tinted?: boolean};

export type NativeTabNavigationOptions = {
  title?: string;
  tabBarLabel?: string;
  tabBarIcon?: NativeTabIcon | ((props: {focused: boolean}) => NativeTabIcon);
  tabBarBadge?: number | string;
  tabBarActiveTintColor?: ColorValue;
  tabBarInactiveTintColor?: ColorValue;
  tabBarLabelVisibilityMode?: 'auto' | 'selected' | 'labeled' | 'unlabeled';
  tabBarMinimizeBehavior?:
    | 'auto'
    | 'automatic'
    | 'never'
    | 'onScrollDown'
    | 'onScrollUp';
  tabBarStyle?: {
    display?: 'flex' | 'none';
    backgroundColor?: ColorValue;
  };
  /**
   * 탭바를 숨긴 뒤 iOS 26 이 남기는 하단 영역을 자를지.
   * 네이티브 상세·댓글·검색만 true. 웹뷰 안 SPA(커뮤니티 글)는
   * 자르면 댓글 입력창 아래에 빈 칸이 생긴다.
   */
  tabBarClipWhenHidden?: boolean;
  lazy?: boolean;
  popToTopOnBlur?: boolean;
  headerShown?: boolean;
  overrideScrollViewContentInsetAdjustmentBehavior?: boolean;
};

type NativeTabNavigationEventMap = {
  tabPress: {data: undefined; canPreventDefault: false};
};

type NativeTabNavigatorProps = DefaultNavigatorOptions<
  ParamListBase,
  string | undefined,
  TabNavigationState<ParamListBase>,
  NativeTabNavigationOptions,
  NativeTabNavigationEventMap,
  unknown
> &
  TabRouterOptions;

function resolveNativeIcon(
  tabBarIcon:
    | NativeTabIcon
    | ((props: {focused: boolean}) => NativeTabIcon)
    | undefined,
  focused: boolean,
): NativeTabIcon | undefined {
  if (!tabBarIcon) return undefined;
  return typeof tabBarIcon === 'function' ? tabBarIcon({focused}) : tabBarIcon;
}

function iosIcon(icon: NativeTabIcon | undefined): PlatformIconIOS | undefined {
  if (!icon) return undefined;
  if (icon.type === 'sfSymbol') {
    return {type: 'sfSymbol', name: icon.name};
  }
  // tinted:false 는 원본 색(연두 채움)을 유지한다. 템플릿으로 넣으면 회색이 된다.
  return icon.tinted === false
    ? {type: 'imageSource', imageSource: icon.source}
    : {type: 'templateSource', templateSource: icon.source};
}

/** Android 는 SF Symbol 이 없다 — 이미지 아이콘만 넘긴다. */
function androidIcon(
  icon: NativeTabIcon | undefined,
): PlatformIconAndroid | undefined {
  return icon?.type === 'image'
    ? {type: 'imageSource', imageSource: icon.source}
    : undefined;
}

function titleAppearance(
  backgroundColor: ColorValue,
  titleColor: ColorValue,
  titleColorActive: ColorValue,
): TabsScreenAppearanceIOS {
  return {
    tabBarBackgroundColor: backgroundColor,
    stacked: {
      normal: {tabBarItemTitleFontColor: titleColor},
      selected: {tabBarItemTitleFontColor: titleColorActive},
    },
  };
}

/** 네이티브가 마지막으로 확인해 준 탭 상태(어느 탭·몇 번째 상태인지). */
type ConfirmedNavState = {routeKey: string; provenance: number};

/**
 * react-native-screens 4.26(Expo 57)의 Tabs.Host / Tabs.Screen 위에 얹은 탭 내비게이터.
 *
 * ★상태 모델: **선택된 탭의 정본은 네이티브**다. JS 는 "이 탭으로 바꿔 달라"를 navStateRequest 로
 * 보내면서, 그 요청이 기반한 상태 번호(baseProvenance = 네이티브가 마지막으로 확인해 준 provenance)를
 * 같이 싣는다. 사용자가 그 사이 다른 탭을 눌렀으면 네이티브가 낡은 요청을 거절하고
 * (rejectStaleNavStateUpdates) onTabSelectionRejected 로 진짜 상태를 알려 준다 → JS 가 그쪽으로 맞춘다.
 * baseProvenance 를 상수(0)로 두면 경합에서 JS 와 네이티브가 다른 탭을 보는 채로 조용히 굳는다.
 * 패턴은 @react-navigation/bottom-tabs 7.20 의 unstable NativeBottomTabView 와 같다.
 */
function NativeBottomTabNavigator({
  id,
  initialRouteName,
  backBehavior,
  children,
  layout,
  screenListeners,
  screenOptions,
  screenLayout,
  UNSTABLE_router,
}: NativeTabNavigatorProps) {
  const {state, navigation, descriptors, NavigationContent} =
    useNavigationBuilder<
      TabNavigationState<ParamListBase>,
      TabRouterOptions,
      TabActionHelpers<ParamListBase>,
      NativeTabNavigationOptions,
      NativeTabNavigationEventMap
    >(TabRouter, {
      id,
      initialRouteName,
      backBehavior,
      children,
      layout,
      screenListeners,
      screenOptions,
      screenLayout,
      UNSTABLE_router,
    });

  const focusedRouteKey = state.routes[state.index].key;
  const [confirmed, setConfirmed] = React.useState<ConfirmedNavState>({
    routeKey: focusedRouteKey,
    provenance: 0,
  });
  const confirm = (next: ConfirmedNavState) =>
    setConfirmed(prev =>
      prev.routeKey === next.routeKey && prev.provenance === next.provenance
        ? prev
        : next,
    );

  /** 네이티브가 알려 준 탭으로 JS 상태를 맞춘다(이미 그 탭이면 확인만 갱신). */
  const followNative = (next: ConfirmedNavState) => {
    confirm(next);
    if (next.routeKey === focusedRouteKey) return;
    const route = state.routes.find(item => item.key === next.routeKey);
    if (!route) return;
    navigation.dispatch({
      ...CommonActions.navigate(route.name, route.params),
      target: state.key,
    });
  };

  const onTabSelected = (event: NativeSyntheticEvent<TabSelectedEvent>) => {
    const {selectedScreenKey, provenance, actionOrigin} = event.nativeEvent;
    const route = state.routes.find(item => item.key === selectedScreenKey);
    if (!route) return;

    // 사용자가 누른 것만 tabPress — 같은 탭 재탭(맨 위로·스택 비우기) 리스너가 이걸 듣는다.
    if (actionOrigin === 'user') {
      navigation.emit({type: 'tabPress', target: route.key});
    }
    // JS 가 보낸 요청의 결과면 확인만 받는다(JS 상태는 이미 그 탭이다).
    if (actionOrigin === 'programmatic-js') {
      confirm({routeKey: selectedScreenKey, provenance});
      return;
    }
    followNative({routeKey: selectedScreenKey, provenance});
  };

  const onTabSelectionRejected = (
    event: NativeSyntheticEvent<TabSelectionRejectedEvent>,
  ) => {
    const {selectedScreenKey, provenance} = event.nativeEvent;
    followNative({routeKey: selectedScreenKey, provenance});
  };

  const focused = descriptors[focusedRouteKey];
  const options = focused?.options;
  const insets = useSafeAreaInsets();
  const hidden = options?.tabBarStyle?.display === 'none';
  const clipPx =
    hidden && options?.tabBarClipWhenHidden
      ? getTabBarClipPx(insets.bottom)
      : 0;
  const minimize =
    options?.tabBarMinimizeBehavior === 'auto'
      ? 'automatic'
      : options?.tabBarMinimizeBehavior;

  const chrome = useChromeColors();
  const titleColor =
    options?.tabBarInactiveTintColor ?? chrome.tabBarInactiveTint;
  const titleColorActive =
    options?.tabBarActiveTintColor ?? chrome.tabBarActiveTint;
  // 화면이 tabBarStyle 을 통째로 바꾸면(숨김 등) backgroundColor 가 빠지므로 크롬 값으로 받친다.
  const tabBarBackground =
    options?.tabBarStyle?.backgroundColor ?? chrome.tabBarBackground;

  return (
    <NavigationContent>
      <SafeAreaProviderCompat>
        <View style={styles.clip}>
          <View style={[styles.fill, hidden ? {marginBottom: -clipPx} : null]}>
            <Tabs.Host
              navStateRequest={{
                selectedScreenKey: focusedRouteKey,
                baseProvenance: confirmed.provenance,
              }}
              rejectStaleNavStateUpdates
              onTabSelected={onTabSelected}
              onTabSelectionRejected={onTabSelectionRejected}
              ios={{tabBarMinimizeBehavior: minimize}}>
              {state.routes.map((route, index) => {
                const descriptor = descriptors[route.key];
                const screen = descriptor.options;
                const isFocused = state.index === index;
                const isPreloaded = state.preloadedRouteKeys.includes(
                  route.key,
                );
                const lazy = screen.lazy !== false;
                const icon = resolveNativeIcon(screen.tabBarIcon, false);
                const selectedIcon = resolveNativeIcon(screen.tabBarIcon, true);

                return (
                  <Tabs.Screen
                    key={route.key}
                    screenKey={route.key}
                    title={screen.tabBarLabel ?? screen.title ?? route.name}
                    badgeValue={screen.tabBarBadge?.toString()}
                    specialEffects={{
                      repeatedTabSelection: {
                        popToRoot: true,
                        scrollToTop: true,
                      },
                    }}
                    ios={{
                      icon: iosIcon(icon),
                      selectedIcon: iosIcon(selectedIcon),
                      standardAppearance: titleAppearance(
                        tabBarBackground,
                        titleColor,
                        titleColorActive,
                      ),
                      // iOS 는 콘텐츠가 끝까지 스크롤된 상태에서 scrollEdgeAppearance 를
                      // 쓴다. 비워 두면 시스템 기본값이 적용돼 **다크모드에서 탭바만
                      // 검게** 뜬다(홈처럼 스크롤 화면에서 재현). 같은 값을 준다.
                      scrollEdgeAppearance: titleAppearance(
                        tabBarBackground,
                        titleColor,
                        titleColorActive,
                      ),
                      overrideScrollViewContentInsetAdjustmentBehavior:
                        screen.overrideScrollViewContentInsetAdjustmentBehavior,
                    }}
                    android={{
                      icon: androidIcon(icon),
                      selectedIcon: androidIcon(selectedIcon),
                      standardAppearance: {
                        tabBarBackgroundColor: tabBarBackground,
                        tabBarItemLabelVisibilityMode:
                          options?.tabBarLabelVisibilityMode,
                        normal: {tabBarItemTitleFontColor: titleColor},
                        selected: {tabBarItemTitleFontColor: titleColorActive},
                      },
                    }}>
                    <Lazy enabled={lazy} visible={isFocused || isPreloaded}>
                      {descriptor.render()}
                    </Lazy>
                  </Tabs.Screen>
                );
              })}
            </Tabs.Host>
          </View>
        </View>
      </SafeAreaProviderCompat>
    </NavigationContent>
  );
}

export function createNativeBottomTabNavigator<
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 호출부 NativeTab 타이핑
  ParamList extends ParamListBase,
>() {
  return createNavigatorFactory(NativeBottomTabNavigator)();
}

const styles = StyleSheet.create({
  clip: {
    flex: 1,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
  },
});
