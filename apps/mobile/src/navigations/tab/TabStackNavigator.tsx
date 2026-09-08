import React, {useCallback, useEffect, useRef} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useIsFocused, useNavigation} from '@react-navigation/native';

import TabWebView from '@/screens/tabs/TabWebView';
import HomeScreen from '@/screens/home/HomeScreen';
import TrendingScreen from '@/screens/trending/TrendingScreen';
import AlarmScreen from '@/screens/alarm/AlarmScreen';
import JirumAlarmWebViewScreen from '@/screens/jirumalarmwebview/JirumAlarmWebViewScreen';
import CurationScreen from '@/screens/curation/CurationScreen';
import TossCurationScreen from '@/screens/curation/TossCurationScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import SearchStackNavigator from './SearchStackNavigator';
import ProductCommentsScreen from '@/screens/comment/ProductCommentsScreen';
// 내정보 — 하위 화면들은 자체 StackHeader 를 그린다(네비게이터 옵션 불필요).
import MyPageScreen from '@/screens/mypage/MyPageScreen';
import AccountScreen from '@/screens/mypage/AccountScreen';
import NicknameScreen from '@/screens/mypage/NicknameScreen';
import PasswordScreen from '@/screens/mypage/PasswordScreen';
import PersonalScreen from '@/screens/mypage/PersonalScreen';
import CategoriesScreen from '@/screens/mypage/CategoriesScreen';
import KeywordScreen from '@/screens/mypage/KeywordScreen';
import TermsPoliciesScreen from '@/screens/mypage/TermsPoliciesScreen';
import PolicyScreen from '@/screens/mypage/PolicyScreen';
import LikeScreen from '@/screens/mypage/LikeScreen';
import ThemesScreen from '@/screens/mypage/ThemesScreen';
import ThemeDetailScreen from '@/screens/mypage/ThemeDetailScreen';
// 커뮤니티 — 글 상세는 setOptions 로 시스템 헤더를 켜고, 글쓰기는 스스로 끈다.
import CommunityScreen from '@/screens/community/CommunityScreen';
import CommunityPostScreen from '@/screens/community/CommunityPostScreen';
import CommunityWriteScreen from '@/screens/community/CommunityWriteScreen';
import {
  tabStackNavigations,
  tabNavigations,
} from '@/shared/constant/navigations';
import {getTabBaseUrl} from '@/shared/lib/navigation/tab-routing';
import {
  setTabBarVisible,
  useTabBarVisibility,
} from '@/shared/hooks/useTabBarVisibility';
import type {TabStackParamList} from './types';
import {
  SCREEN_BACKGROUND_COLOR,
  baseHeaderOptions,
  commentsHeaderOptions,
  productDetailHeaderOptions,
} from './native-headers';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

const Stack = createNativeStackNavigator<TabStackParamList>();

/**
 * 이 탭의 탭바 표시를 숨김 카운터와 맞춘다.
 * JS 탭바는 AnimatedTabBar 가 translateY 로도 숨기지만,
 * tabBarStyle.display 를 같이 맞춰 두면 레이아웃 여백이 안 남는다.
 *
 * iOS 26 clip 은 네이티브로 push 한 화면만 켠다. 웹뷰 안 SPA 는
 * 자르면 댓글 입력창 아래가 빈다.
 */
function useSyncNativeTabBarHidden() {
  const visible = useTabBarVisibility();
  const navigation = useNavigation();
  const clipWhenHiddenRef = useRef(false);

  const apply = useCallback(
    (clipWhenHidden: boolean) => {
      clipWhenHiddenRef.current = clipWhenHidden;
      navigation.setOptions({
        tabBarStyle: {display: visible ? 'flex' : 'none'},
        tabBarClipWhenHidden: !visible && clipWhenHidden,
      });
    },
    [visible, navigation],
  );

  useEffect(() => {
    apply(clipWhenHiddenRef.current);
  }, [apply]);

  return useCallback(
    (routeName: string | undefined) => {
      apply(routeName !== tabStackNavigations.ROOT);
    },
    [apply],
  );
}

/**
 * 이 라우트에서 탭바를 숨기나.
 *
 * ★화면마다 useHideTabBar 를 거는 대신 **라우트 이름 하나로** 판단한다.
 * 화면별 훅은 focus/cleanup 순서에 의존해서 카운터가 새기 쉬웠다 —
 * 탭 5개가 각자 같은 스택을 갖고 있어 특히 그렇다(탭바가 사라져 안 돌아오던
 * 증상의 뿌리). 라우트는 언제나 정확히 하나이므로 어긋날 수가 없다.
 */
function hidesTabBar(routeName: string | undefined): boolean {
  return (
    // ★상세는 숨기지 않는다(2026-08-17 사용자 지시). 찜/구매 CTA 가 탭바
    // 위에 얹히므로 BottomCTA 가 탭바 높이만큼 더 띄운다.
    // web 은 상세에서 BottomNav 를 아예 렌더하지 않지만 앱은 다르게 간다.
    routeName === tabStackNavigations.COMMENTS ||
    routeName === tabStackNavigations.SEARCH ||
    routeName === tabStackNavigations.CURATION ||
    routeName === tabStackNavigations.TOSS_CURATION ||
    routeName === tabStackNavigations.WEBVIEW ||
    // 내정보·커뮤니티 하위 화면. web 도 탭 루트가 아니면 하단바를 안 그린다
    // (isTabRootPath). 상세만 예외로 탭바를 남긴다(위 주석 참조).
    MYPAGE_SUB_ROUTES.has(routeName ?? '') ||
    COMMUNITY_SUB_ROUTES.has(routeName ?? '')
  );
}

const MYPAGE_SUB_ROUTES: ReadonlySet<string> = new Set([
  tabStackNavigations.MYPAGE_ACCOUNT,
  tabStackNavigations.MYPAGE_NICKNAME,
  tabStackNavigations.MYPAGE_PASSWORD,
  tabStackNavigations.MYPAGE_PERSONAL,
  tabStackNavigations.MYPAGE_CATEGORIES,
  tabStackNavigations.MYPAGE_KEYWORD,
  tabStackNavigations.MYPAGE_TERMS,
  tabStackNavigations.POLICY,
  tabStackNavigations.LIKE,
  tabStackNavigations.THEMES,
  tabStackNavigations.THEME_DETAIL,
]);

const COMMUNITY_SUB_ROUTES: ReadonlySet<string> = new Set([
  tabStackNavigations.COMMUNITY_POST,
  tabStackNavigations.COMMUNITY_WRITE,
]);

/**
 * 탭 하나를 감싸는 네이티브 스택.
 *
 * 루트는 기존 탭 WebView 그대로. 상세는 그 위에 push 되어 네이티브 슬라이드
 * 전환을 탄다 — 전환 중 이전 화면이 뒤에 남으므로 흰 화면이 안 생긴다.
 * iOS 스와이프 뒤로가기도 스택이 알아서 붙여준다.
 */
/**
 * 큐레이션 등 웹 페이지를 탭 스택에 쌓는 화면.
 * JirumAlarmWebViewScreen 은 MainParamList 로 타이핑돼 있어 그대로 못 넣는다 —
 * params 모양({uri})이 같으므로 얇게 감싼다.
 */
function TabWebViewPage({
  route,
}: {
  route: {params: {uri: string; title?: string}};
}) {
  const Screen = JirumAlarmWebViewScreen as unknown as React.ComponentType<{
    route: {params: {uri: string}};
  }>;
  return <Screen route={{params: {uri: route.params.uri}}} />;
}

export function createTabStack(tabName: TabName) {
  return function TabStack() {
    const onFocusedRoute = useSyncNativeTabBarHidden();
    // 이 탭이 지금 화면에 보이는 탭인가. 포커스가 바뀔 때 자기 스택 기준으로
    // 다시 맞추기 위한 것이고, 리스너 안에서는 ref 대신 navigation.isFocused()
    // 를 직접 쓴다(위 리스너 주석 참조).
    const isTabFocused = useIsFocused();
    // 이 탭 **스택**의 최상단 라우트. 아래 state 리스너가 유일한 갱신자다.
    // 스택 밖(여기)에서는 스택 상태를 직접 읽을 수 없다 — `useNavigation()` 은
    // 탭 네비게이터를 가리키므로 `getState()` 가 라우트가 아니라 **탭 이름**을 준다.
    const focusedRouteRef = useRef<string | undefined>(
      tabStackNavigations.ROOT,
    );

    // 이 탭으로 돌아왔을 때 자기 스택 최상단 기준으로 다시 맞춘다.
    // (다른 탭에 있는 동안 이 탭의 리스너는 위 가드로 막혀 있었다)
    const navigation = useNavigation();
    useEffect(() => {
      if (!isTabFocused) return;
      // 🔴예전엔 `navigation.getState()` 를 읽었는데 그건 **탭 네비게이터**의
      // 상태라 focused 가 'CommunityTab' 같은 **탭 이름**이었다. hidesTabBar 는
      // 라우트 이름을 기대하므로 언제나 false → **탭으로 돌아오면 상세·댓글
      // 화면에서도 탭바를 다시 켰다**(리스너가 방금 숨긴 것을 덮어씀).
      // iOS 26 실측: 딥링크로 탭 전환+push 하면 글 상세에 탭바가 남아 댓글
      // 입력창을 덮었다. 스택의 라우트는 리스너가 ref 에 넣어 둔다.
      setTabBarVisible(!hidesTabBar(focusedRouteRef.current));
    }, [isTabFocused]);

    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // 지정 안 하면 전환 애니메이션 동안 시스템 기본 배경이 보인다.
          // 아직 아무것도 안 그린 WebView 가 올라올 때 특히 티가 난다.
          contentStyle: {backgroundColor: SCREEN_BACKGROUND_COLOR},
        }}
        screenListeners={{
          state: e => {
            const stack = e.data.state;
            const focused = stack.routes[stack.index]?.name;
            focusedRouteRef.current = focused;
            onFocusedRoute(focused);
            // ★탭바 표시는 여기서 한 곳으로 정한다(화면별 훅 대신).
            //
            // ★★단 **이 탭이 지금 보고 있는 탭일 때만**. 이 리스너는 탭 5개의
            // 스택에서 각각 돌기 때문에, 발견 탭에 상세를 열어둔 채 홈으로 오면
            // 발견 탭 리스너가 false 로 덮어써 홈에서도 탭바가 사라진다.
            //
            // 🔴판정은 **호출 시점에 직접** 묻는다(`navigation.isFocused()`).
            // 예전엔 ref 를 봤는데, 딥링크가 탭 전환과 push 를 한 번에 하면
            // (`navigate(tab, {screen})`) 이 리스너가 **ref 가 갱신되기 전에**
            // 돌아서 업데이트를 건너뛴다 → 글 상세인데 탭바가 남아 댓글
            // 입력창을 덮는다(iOS 26 시뮬레이터 실측). ref 는 렌더 뒤에 갱신되고
            // 네비게이션 이벤트는 그 사이에 온다.
            if (navigation.isFocused()) {
              setTabBarVisible(!hidesTabBar(focused));
            }
          },
        }}>
        <Stack.Screen name={tabStackNavigations.ROOT}>
          {() => {
            // ★홈·발견·알림은 네이티브 화면이 정본이다(플래그 없음).
            // 2026-09-07 에 `constants/feature-flags.ts` 를 지웠다 — 세 탭 모두
            // 릴리스 3회를 넘겼고, 되돌릴 일이 생기면 플래그를 켜는 게 아니라
            // 해당 커밋을 `eas update` 로 내보내는 쪽이 맞다.
            // 커뮤니티·내정보는 아직 루트가 웹뷰라 아래 TabWebView 가 받는다.
            switch (tabName) {
              case tabNavigations.HOME:
                return <HomeScreen />;
              case tabNavigations.DISCOVER:
                return <TrendingScreen />;
              case tabNavigations.ALARM:
                return <AlarmScreen />;
              case tabNavigations.COMMUNITY:
                return <CommunityScreen />;
              case tabNavigations.MYPAGE:
                return <MyPageScreen />;
              // ★2026-09-08 로 다섯 탭 전부 네이티브가 되어 이 아래는 더 이상
              // 도달하지 않는다. TabWebView 와 그에 딸린 웹뷰 ref·주입 경로
              // (WebViewRefProvider·getWebViewRef)는 **별도 정리 대상**이다 —
              // 같은 변경에서 지우면 검증 범위가 두 배가 되므로 폴백으로 남긴다.
              default:
                return (
                  <TabWebView
                    tabName={tabName}
                    baseUrl={getTabBaseUrl(tabName)}
                  />
                );
            }
          }}
        </Stack.Screen>
        <Stack.Screen
          name={tabStackNavigations.DETAIL}
          component={ProductDetailScreen}
          options={productDetailHeaderOptions}
        />
        <Stack.Screen
          name={tabStackNavigations.SEARCH}
          component={SearchStackNavigator}
        />
        <Stack.Screen
          name={tabStackNavigations.CURATION}
          component={CurationScreen}
          options={({route}) => ({
            ...baseHeaderOptions,
            title: route.params?.title ?? '',
          })}
        />
        <Stack.Screen
          name={tabStackNavigations.TOSS_CURATION}
          component={TossCurationScreen}
          options={{
            ...baseHeaderOptions,
            title: '',
          }}
        />
        <Stack.Screen
          name={tabStackNavigations.WEBVIEW}
          component={TabWebViewPage}
          // ★네이티브 헤더를 띄우지 않는다. 여기서 여는 web 페이지
          // (/toss·/curation)는 **자체 헤더**(제목·뒤로가기·검색·공유)를
          // 갖고 있어 헤더가 두 개로 겹친다. 뒤로가기는 웹 헤더와
          // iOS 스와이프가 담당한다.
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={tabStackNavigations.COMMENTS}
          component={ProductCommentsScreen}
          options={commentsHeaderOptions}
        />

        {/* ── 내정보 ──
            옵션을 주지 않는다: 각 화면이 StackHeader 를 직접 그리고,
            약관·정책은 web 페이지가 자체 헤더를 갖는다(두 겹 방지). */}
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_ACCOUNT}
          component={AccountScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_NICKNAME}
          component={NicknameScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_PASSWORD}
          component={PasswordScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_PERSONAL}
          component={PersonalScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_CATEGORIES}
          component={CategoriesScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_KEYWORD}
          component={KeywordScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.MYPAGE_TERMS}
          component={TermsPoliciesScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.POLICY}
          component={PolicyScreen}
        />
        <Stack.Screen name={tabStackNavigations.LIKE} component={LikeScreen} />
        <Stack.Screen
          name={tabStackNavigations.THEMES}
          component={ThemesScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.THEME_DETAIL}
          component={ThemeDetailScreen}
        />

        {/* ── 커뮤니티 ── 두 화면 모두 헤더를 스스로 결정한다(setOptions). */}
        <Stack.Screen
          name={tabStackNavigations.COMMUNITY_POST}
          component={CommunityPostScreen}
        />
        <Stack.Screen
          name={tabStackNavigations.COMMUNITY_WRITE}
          component={CommunityWriteScreen}
        />
      </Stack.Navigator>
    );
  };
}
