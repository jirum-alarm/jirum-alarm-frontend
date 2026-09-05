import type {NativeStackNavigationOptions} from '@react-navigation/native-stack';

/**
 * 시스템 네이티브 헤더의 색. **className 이 안 먹는 자리라** 여기 상수가 정본이다.
 * 다크모드 착수 시 고칠 곳도 여기 한 곳 — 화면별로 흩어 두지 말 것.
 * ponytail: 지금은 라이트 고정값. `useColorScheme()` 분기는 웹뷰 탭 3개가
 * 네이티브로 넘어와 앱 전체가 다크를 지원할 때 (gray-900 / gray-50) 로 확장한다.
 */
export const HEADER_TINT_COLOR = '#101828'; // gray-900
export const HEADER_BACKGROUND_COLOR = '#ffffff';

/**
 * 하단 탭바 표면색. ⚠️**JS 탭바(`MainTabNavigator`)와 네이티브 탭바
 * (`createNativeBottomTabNavigator`) 두 벌이 같은 값을 써야 한다** — 어긋나면
 * 탭바만 다른 색으로 갈린다. 여기서 한 번 정하고 양쪽이 가져간다.
 */
export const TAB_BAR_BACKGROUND_COLOR = '#ffffff';
export const TAB_BAR_BORDER_COLOR = '#D0D5DD'; // gray-300

/**
 * 화면 본문 바탕 — 네이티브 스택 `contentStyle` 과 WebView 로딩 오버레이가 쓴다.
 * 이걸 안 주면 화면 전환 애니메이션 동안, 그리고 아직 아무것도 안 그린 WebView
 * 위로 시스템 기본 배경이 그대로 보인다(흰 화면의 정체).
 * 헤더·탭바와 값은 같지만 의미가 다른 자리라 상수를 따로 둔다 — 다크모드 때
 * 크롬과 본문은 다른 톤으로 갈릴 수 있다.
 */
export const SCREEN_BACKGROUND_COLOR = '#ffffff';

/** 모든 시스템 헤더가 공유하는 바탕. 개별 옵션은 이걸 펼치고 title 만 덧붙인다. */
export const baseHeaderOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerShadowVisible: false,
  headerTintColor: HEADER_TINT_COLOR,
  headerBackButtonDisplayMode: 'minimal',
  headerStyle: {backgroundColor: HEADER_BACKGROUND_COLOR},
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
