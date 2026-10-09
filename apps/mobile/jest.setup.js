/* eslint-env jest */
// PressableScale 이 RNGH Gesture.Manual + Reanimated 로 눌림 애니메이션을 UI 스레드에서 돌린다.
// 둘 다 네이티브 모듈이라 jest 엔 없다 — 각 라이브러리의 공식 목을 깐다.
require('react-native-gesture-handler/jestSetup');
// Reanimated 4.5 의 mock 도 react-native-worklets 를 불러온다 — worklets 는 네이티브 모듈이 없으면
// 모듈 평가 중에 죽으므로(loadUnpackers) 그쪽 공식 목을 먼저 깐다.
jest.mock('react-native-worklets', () =>
  require('react-native-worklets/src/mock'),
);
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);
