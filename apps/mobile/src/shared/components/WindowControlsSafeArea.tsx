import React, {useMemo} from 'react';
import {Platform} from 'react-native';
import {
  SafeAreaInsetsContext,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/**
 * iPadOS 26+ 는 창 왼쪽 위에 창 조작 버튼(신호등)을 그린다. 시스템 safe area 는 이 자리를 빼 주지 않아
 * (UIKit 은 cornerAdaptation 레이아웃 가이드로만 알려 준다) 헤더 로고·뒤로가기가 그 밑에 깔렸다.
 * 화면마다 고치는 대신 iPad 에서만 위쪽 inset 을 버튼 아래까지 내린다 — useSafeAreaInsets 를 쓰는
 * 모든 헤더가 같이 내려간다.
 *
 * ponytail: 버튼 자리(창 위 42~65pt, iPadOS 27 실측)를 상수로 둔다. 애플이 옮기면 이 값만 고친다.
 * 전체 화면 모드에서도 같은 여백을 쓴다(iPad 는 세로 여유가 있어 감수).
 */
const WINDOW_CONTROLS_BOTTOM = 68;

// ★Platform.isPad 로 보면 안 된다 — 이 앱은 iPhone 전용(TARGETED_DEVICE_FAMILY=1)이라 iPad 에선
// 호환 모드로 돌고 idiom 이 'phone' 이다. OS 이름은 그래도 'iPadOS' 다(iPadOS 27 시뮬 실측).
export const hasWindowControls = (
  os: string,
  systemName: string | undefined,
  version: string | number,
): boolean =>
  os === 'ios' &&
  systemName === 'iPadOS' &&
  Number.parseInt(String(version), 10) >= 26;

const showsWindowControls = hasWindowControls(
  Platform.OS,
  Platform.OS === 'ios' ? Platform.constants.systemName : undefined,
  Platform.Version,
);

export default function WindowControlsSafeArea({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const adjusted = useMemo(
    () => ({...insets, top: Math.max(insets.top, WINDOW_CONTROLS_BOTTOM)}),
    [insets],
  );
  if (!showsWindowControls) return <>{children}</>;
  return (
    <SafeAreaInsetsContext.Provider value={adjusted}>
      {children}
    </SafeAreaInsetsContext.Provider>
  );
}
