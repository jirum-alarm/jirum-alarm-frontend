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
import {BottomTabs, BottomTabsScreen} from 'react-native-screens';
import type {ColorValue, ImageSourcePropType} from 'react-native';

import {getTabBarClipPx} from './tab-bar-metrics';

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

type NativeScreenIcon = NonNullable<
  React.ComponentProps<typeof BottomTabsScreen>['icon']
>;

function toScreensIcon(
  icon: NativeTabIcon | undefined,
): NativeScreenIcon | undefined {
  if (!icon) return undefined;
  if (icon.type === 'sfSymbol') {
    return {sfSymbolName: icon.name};
  }
  // tinted:false 는 원본 색(연두 채움)을 유지한다. 템플릿으로 넣으면 회색이 된다.
  return icon.tinted === false
    ? {imageSource: icon.source}
    : {templateSource: icon.source};
}

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

function resolveIcon(
  tabBarIcon:
    | NativeTabIcon
    | ((props: {focused: boolean}) => NativeTabIcon)
    | undefined,
  focused: boolean,
): NativeScreenIcon | undefined {
  return toScreensIcon(resolveNativeIcon(tabBarIcon, focused));
}

function androidIconResource(
  tabBarIcon:
    | NativeTabIcon
    | ((props: {focused: boolean}) => NativeTabIcon)
    | undefined,
  focused: boolean,
): ImageSourcePropType | undefined {
  const icon = resolveNativeIcon(tabBarIcon, focused);
  return icon?.type === 'image' ? icon.source : undefined;
}

function titleAppearance(
  titleColor: ColorValue,
  titleColorActive: ColorValue,
): NonNullable<
  React.ComponentProps<typeof BottomTabsScreen>['standardAppearance']
> {
  return {
    tabBarBackgroundColor: '#ffffff',
    stacked: {
      normal: {tabBarItemTitleFontColor: titleColor},
      selected: {tabBarItemTitleFontColor: titleColorActive},
    },
  };
}

/**
 * Expo 54 의 react-native-screens 4.16 은 Tabs.Host 가 없다.
 * 같은 네이티브 UITabBar 를 BottomTabs / BottomTabsScreen 으로 붙인다.
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

  const focused = descriptors[state.routes[state.index].key];
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

  const titleColor = options?.tabBarInactiveTintColor ?? '#667085';
  const titleColorActive = options?.tabBarActiveTintColor ?? '#101828';

  return (
    <NavigationContent>
      <SafeAreaProviderCompat>
        <View style={styles.clip}>
          <View style={[styles.fill, hidden ? {marginBottom: -clipPx} : null]}>
            <BottomTabs
              tabBarItemTitleFontColor={titleColor}
              tabBarItemTitleFontColorActive={titleColorActive}
              tabBarItemLabelVisibilityMode={options?.tabBarLabelVisibilityMode}
              tabBarMinimizeBehavior={minimize}
              tabBarBackgroundColor={
                options?.tabBarStyle?.backgroundColor ?? '#ffffff'
              }
              experimentalControlNavigationStateInJS
              onNativeFocusChange={event => {
                const route = state.routes.find(
                  item => item.key === event.nativeEvent.tabKey,
                );
                if (!route) return;

                navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                });

                const isFocused =
                  state.index ===
                  state.routes.findIndex(item => item.key === route.key);
                if (!isFocused) {
                  navigation.dispatch({
                    ...CommonActions.navigate(route.name, route.params),
                    target: state.key,
                  });
                }
              }}>
              {state.routes.map((route, index) => {
                const descriptor = descriptors[route.key];
                const screen = descriptor.options;
                const isFocused = state.index === index;
                const isPreloaded = state.preloadedRouteKeys.includes(
                  route.key,
                );
                const lazy = screen.lazy !== false;
                const icon = resolveIcon(screen.tabBarIcon, false);
                const selectedIcon = resolveIcon(screen.tabBarIcon, true);

                return (
                  <BottomTabsScreen
                    key={route.key}
                    tabKey={route.key}
                    isFocused={isFocused}
                    title={screen.tabBarLabel ?? screen.title ?? route.name}
                    icon={icon}
                    selectedIcon={selectedIcon}
                    iconResource={androidIconResource(
                      screen.tabBarIcon,
                      isFocused,
                    )}
                    standardAppearance={titleAppearance(
                      titleColor,
                      titleColorActive,
                    )}
                    badgeValue={screen.tabBarBadge?.toString()}
                    overrideScrollViewContentInsetAdjustmentBehavior={
                      screen.overrideScrollViewContentInsetAdjustmentBehavior
                    }
                    specialEffects={{
                      repeatedTabSelection: {
                        popToRoot: true,
                        scrollToTop: true,
                      },
                    }}>
                    <Lazy enabled={lazy} visible={isFocused || isPreloaded}>
                      {descriptor.render()}
                    </Lazy>
                  </BottomTabsScreen>
                );
              })}
            </BottomTabs>
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
