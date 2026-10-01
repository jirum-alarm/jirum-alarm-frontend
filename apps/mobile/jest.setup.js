/* eslint-env jest */
// PressableScale 이 RNGH Gesture.Manual + Reanimated 로 눌림 애니메이션을 UI 스레드에서 돌린다.
// 둘 다 네이티브 모듈이라 jest 엔 없다 — 각 라이브러리의 공식 목을 깐다.
require('react-native-gesture-handler/jestSetup');
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
