import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from 'react';
import {
  Platform,
  StatusBar,
  type StatusBarStyle,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  type EdgeInsets,
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/**
 * 아이폰 듀오(iOS 27.1 SDK 빌드)는 상태 표시줄이 화면 오른쪽 위 세로 기둥이고, 시스템은 그 폭을 오른쪽 safe area
 * 로 준다(접힌 바깥 화면 right 84pt — 시뮬레이터 실측 2026-10-22). 화면들은 좌우 inset 을 쓰지 않아 헤더 아이콘·배너가
 * 그 밑에 깔렸다. 화면마다 고치는 대신 앱 전체를 좌우 inset 만큼 들이고(애플이 27.0 SDK 앱에 해 주는 «상태 표시줄 왼쪽만
 * 쓰기»와 같은 모양), 안쪽엔 좌우 0 을 알려 다시 더하지 않게 한다. 가로로 돌린 아이폰의 노치 쪽 여백도 같이 해결된다.
 *
 * 들인 자리(기둥)엔 상태 표시줄 글자가 그려지는데 글자색은 화면마다 앱이 정한다(SystemBars → StatusBar.setBarStyle,
 * 홈 맨 위 = 흰 글자, 라이트 테마의 'auto' = 검은 글자). 기둥 색을 그 반대로 따라가야 시간이 보인다 — 짙은 기둥에
 * 검은 글자면 안 보였다(랭킹 화면 실측). 접고 펼 때 inset 이 바뀌어도 트리 모양은 그대로라 화면이 다시 마운트되지 않는다. RN Modal 은 별도 창이라 여기서 빠진다 — 모서리에 버튼을 두는 모달은 안에 SafeAreaProvider 를
 * 따로 두고 insets.left·right 를 직접 쓴다(ImageViewerModal).
 *
 * 화면 폭으로 크기를 재는 곳(슬라이더·페이저)은 창 폭이 아니라 useContentWidth() 를 쓴다 — 창 폭(466)으로 재면
 * 들인 뒤의 실제 폭(382)보다 커서 오른쪽이 잘리고 가운데가 어긋난다. Modal 안은 창 전체라 useWindowDimensions 그대로.
 */
const ContentWidthContext = createContext<number | null>(null);

export function useContentWidth(): number {
  const {width} = useWindowDimensions();
  return useContext(ContentWidthContext) ?? width;
}

export const sideInsets = (
  os: string,
  insets: Pick<EdgeInsets, 'left' | 'right'>,
): {left: number; right: number} =>
  os === 'ios' ? {left: insets.left, right: insets.right} : {left: 0, right: 0};

/** 상태 표시줄 글자색의 반대 바탕. 'default' 는 iOS 가 바탕 밝기로 글자색을 고르므로 테마 바탕. */
export const sideColumnClass = (barStyle: StatusBarStyle): string =>
  barStyle === 'light-content'
    ? 'bg-fixed-900'
    : barStyle === 'dark-content'
    ? 'bg-fixed-white'
    : 'bg-white';

// StatusBar 는 바뀐 걸 알려 주지 않아 setBarStyle 을 감싸 지금 값을 들고 있는다(원본은 this 를 안 쓴다).
let currentBarStyle: StatusBarStyle = 'default';
const barStyleListeners = new Set<() => void>();
if (Platform.OS === 'ios') {
  const setBarStyle = StatusBar.setBarStyle;
  StatusBar.setBarStyle = (style, animated) => {
    setBarStyle(style, animated);
    currentBarStyle = style;
    barStyleListeners.forEach(listener => listener());
  };
}
const subscribeBarStyle = (listener: () => void) => {
  barStyleListeners.add(listener);
  return () => {
    barStyleListeners.delete(listener);
  };
};

export default function SideSafeArea({children}: {children: React.ReactNode}) {
  const insets = useSafeAreaInsets();
  const {width} = useWindowDimensions();
  const barStyle = useSyncExternalStore(
    subscribeBarStyle,
    () => currentBarStyle,
  );
  const inner = useMemo(() => ({...insets, left: 0, right: 0}), [insets]);
  // 안드로이드는 손대지 않는다(실측 전). Platform.OS 는 실행 중 안 바뀌어 트리가 갈아 끼워지지 않는다.
  if (Platform.OS !== 'ios') return <>{children}</>;
  const side = sideInsets(Platform.OS, insets);
  return (
    <View
      className={`flex-1 ${sideColumnClass(barStyle)}`}
      style={{paddingLeft: side.left, paddingRight: side.right}}>
      <ContentWidthContext.Provider value={width - side.left - side.right}>
        <SafeAreaInsetsContext.Provider value={inner}>
          {children}
        </SafeAreaInsetsContext.Provider>
      </ContentWidthContext.Provider>
    </View>
  );
}
