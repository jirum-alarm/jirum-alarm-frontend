import {StyleSheet} from 'react-native';

/**
 * 커뮤니티 화면들이 공유하는 간격·치수.
 *
 * ★왜 className 이 아니라 style 인가: 이 레포 규칙이 **flex·간격·치수는
 * `style`, 색·padding·정렬은 `className`** 이다(NativeWind 가 크기 클래스를
 * 껍데기에 못 주는 함정 때문 — 런북 참조). 그리고 인라인 객체로 쓰면
 * eslint `react-native/no-inline-styles` 가 매번 경고하므로 여기 모아둔다.
 */
export const gaps = StyleSheet.create({
  g4: {gap: 4},
  g6: {gap: 6},
  g8: {gap: 8},
  g12: {gap: 12},
  g16: {gap: 16},
});
