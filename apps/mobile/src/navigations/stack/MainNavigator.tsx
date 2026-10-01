import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import MainTabNavigator from '@/navigations/tab/MainTabNavigator';
import AppStackHeader from '@/navigations/tab/AppStackHeader';
import SearchStackNavigator from '@/navigations/tab/SearchStackNavigator';
import {
  baseHeaderOptions,
  commentsHeaderOptions,
  productDetailHeaderOptions,
  useChromeColors,
} from '@/navigations/tab/native-headers';
import type {TabStackParamList} from '@/navigations/tab/types';
import JirumAlarmWebViewScreen from '@/screens/jirumalarmwebview/JirumAlarmWebViewScreen';
import CurationScreen from '@/screens/curation/CurationScreen';
import TossCurationScreen from '@/screens/curation/TossCurationScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import ProductCommentsScreen from '@/screens/comment/ProductCommentsScreen';
// 내정보 — 하위 화면들은 자체 StackHeader 를 그린다(네비게이터 옵션 불필요).
import AccountScreen from '@/screens/mypage/AccountScreen';
import NicknameScreen from '@/screens/mypage/NicknameScreen';
import PasswordScreen from '@/screens/mypage/PasswordScreen';
import PersonalScreen from '@/screens/mypage/PersonalScreen';
import CategoriesScreen from '@/screens/mypage/CategoriesScreen';
import KeywordScreen from '@/screens/mypage/KeywordScreen';
import NotificationSettingScreen from '@/screens/mypage/NotificationSettingScreen';
import TermsPoliciesScreen from '@/screens/mypage/TermsPoliciesScreen';
import PolicyScreen from '@/screens/mypage/PolicyScreen';
import LikeScreen from '@/screens/mypage/LikeScreen';
import ThemesScreen from '@/screens/mypage/ThemesScreen';
import ThemeDetailScreen from '@/screens/mypage/ThemeDetailScreen';
import CommunityPostScreen from '@/screens/community/CommunityPostScreen';
import CommunityWriteScreen from '@/screens/community/CommunityWriteScreen';
import {PendingLoginRestore} from '@/shared/hooks/PendingLoginRestore';
import useAlarmDotSync from '@/shared/hooks/useAlarmDotSync';
import {
  mainNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import PushPermissionPrePrompt from '@/shared/components/PushPermissionPrePrompt';
import UpdateAvailableSheet from '@/shared/components/UpdateAvailableSheet';

/** @deprecated 기존 단일 WebView 화면에서 사용하던 타입. 호환성 유지용. */
export type MainParamList = {
  [mainNavigations.JIRUM_ALARM_WEBVIEW]: {uri?: string};
};

const RootStack = createNativeStackNavigator<TabStackParamList>();

// 모듈 스코프 — 렌더마다 새 함수를 만들면 헤더가 매번 다시 마운트된다.
const renderAppStackHeader = (
  props: React.ComponentProps<typeof AppStackHeader>,
) => <AppStackHeader {...props} />;

/**
 * 큐레이션 등 웹 페이지를 스택에 쌓는 화면.
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

/**
 * 로그인 뒤 앱 전체 = **루트 스택**. 첫 화면이 하단 탭 전체이고, 상세·댓글·검색·큐레이션·
 * 웹뷰·내정보 하위·커뮤니티 글은 전부 그 위에 push 된다.
 *
 * ★탭 안 스택에 쌓지 않는 이유: 그러면 탭바가 화면 위에 남아 화면마다 숨기고 되살려야 했다.
 * 그 타이밍(전환 시작·끝·스와이프 취소)이 늘 어긋나 "상세에서 나오면 바텀바가 뒤늦게 생긴다·
 * 깜빡인다"(2026-10-01 사용자)가 반복됐다. 여기 쌓으면 상세가 탭바째 덮고, 뒤로 가면 원래 있던
 * 탭바가 그대로 드러난다 — 숨기고 되살리는 코드 자체가 없다(iOS 기본 앱들과 같은 구조).
 * 화면 이름은 그대로라 탭 루트의 `navigation.push(DETAIL)` 는 탭 스택에 없는 이름이어서
 * 이 스택까지 올라와 처리된다.
 */
function MainStackNavigator() {
  // 탭바 알림 점의 원료(미읽음 수)를 앱 진입·포그라운드 복귀마다 받아온다.
  // 탭 화면 밖(여기)에 두는 이유: 알림 탭을 한 번도 안 열어도 점은 떠야 한다.
  useAlarmDotSync();
  const chrome = useChromeColors();

  return (
    <>
      <PendingLoginRestore />
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          // 헤더를 켜는 화면은 전부 JS 헤더로 그린다(iOS 26 유리 헤더가 회색으로 비침).
          header: renderAppStackHeader,
          // 지정 안 하면 전환 애니메이션 동안 시스템 기본 배경이 보인다.
          // 아직 아무것도 안 그린 WebView 가 올라올 때 특히 티가 난다.
          contentStyle: {backgroundColor: chrome.screenBackground},
        }}>
        <RootStack.Screen
          name={mainNavigations.TABS}
          component={MainTabNavigator}
        />
        <RootStack.Screen
          name={tabStackNavigations.DETAIL}
          component={ProductDetailScreen}
          options={productDetailHeaderOptions}
        />
        <RootStack.Screen
          name={tabStackNavigations.SEARCH}
          component={SearchStackNavigator}
        />
        <RootStack.Screen
          name={tabStackNavigations.CURATION}
          component={CurationScreen}
          options={({route}) => ({
            ...baseHeaderOptions,
            title: route.params?.title ?? '',
          })}
        />
        <RootStack.Screen
          name={tabStackNavigations.TOSS_CURATION}
          component={TossCurationScreen}
          options={{
            ...baseHeaderOptions,
            title: '',
          }}
        />
        <RootStack.Screen
          name={tabStackNavigations.WEBVIEW}
          component={TabWebViewPage}
          // ★네이티브 헤더를 띄우지 않는다. 여기서 여는 web 페이지
          // (/toss·/curation)는 **자체 헤더**(제목·뒤로가기·검색·공유)를
          // 갖고 있어 헤더가 두 개로 겹친다. 뒤로가기는 웹 헤더와
          // iOS 스와이프가 담당한다.
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name={tabStackNavigations.COMMENTS}
          component={ProductCommentsScreen}
          options={commentsHeaderOptions}
        />

        {/* ── 내정보 ──
            옵션을 주지 않는다: 각 화면이 StackHeader 를 직접 그리고,
            약관·정책은 web 페이지가 자체 헤더를 갖는다(두 겹 방지). */}
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_ACCOUNT}
          component={AccountScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_NICKNAME}
          component={NicknameScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_PASSWORD}
          component={PasswordScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_PERSONAL}
          component={PersonalScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_CATEGORIES}
          component={CategoriesScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_KEYWORD}
          component={KeywordScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_NOTIFICATION}
          component={NotificationSettingScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.MYPAGE_TERMS}
          component={TermsPoliciesScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.POLICY}
          component={PolicyScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.LIKE}
          component={LikeScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.THEMES}
          component={ThemesScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.THEME_DETAIL}
          component={ThemeDetailScreen}
        />

        {/* ── 커뮤니티 ── 두 화면 모두 헤더를 스스로 결정한다(setOptions). */}
        <RootStack.Screen
          name={tabStackNavigations.COMMUNITY_POST}
          component={CommunityPostScreen}
        />
        <RootStack.Screen
          name={tabStackNavigations.COMMUNITY_WRITE}
          component={CommunityWriteScreen}
        />
      </RootStack.Navigator>
      <PushPermissionPrePrompt />
      <UpdateAvailableSheet />
    </>
  );
}

export default MainStackNavigator;
