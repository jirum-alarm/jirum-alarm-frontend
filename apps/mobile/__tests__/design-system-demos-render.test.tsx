/**
 * 앱 부품 놀이터의 데모(screens/design-system DEMOS)를 라이트·다크로 한 번씩 그린다 — web 은 놀이터 스토리가 두 테마로 자동 검사되는데
 * 앱 부품은 숨은 화면을 손으로 열어야만 봤다. 여기서 막는 것: ① 한 테마에서만 던지는 부품 ② 다크에서도 라이트 회색 hex 를
 * 그대로 쓰는 색 속성(useColors() 를 안 거친 hex — 다크에서 바탕에 묻힌다).
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import * as RN from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

jest.mock('../global.css', () => ({}));
jest.mock('react-native-keyboard-controller', () => {
  const state = {isVisible: false, height: 0};
  return {
    useKeyboardState: (select?: (s: typeof state) => unknown) =>
      select ? select(state) : state,
  };
});

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: Object.assign(() => null, {show: jest.fn(), hide: jest.fn()}),
}));
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));

jest.mock('expo-web-browser', () => ({openBrowserAsync: jest.fn()}));

const {light, dark} = require('@jirum/design-system');

let scheme: 'light' | 'dark' = 'light';
jest.spyOn(RN, 'useColorScheme').mockImplementation(() => scheme);

import {DEMOS} from '../src/screens/design-system/DesignSystemScreen';

type Tree = ReactTestRenderer.ReactTestRenderer;
const render = (el: React.ReactElement): Tree => {
  let tree!: Tree;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(el);
  });
  return tree;
};

const COLOR_PROPS = [
  'color',
  'fill',
  'stroke',
  'placeholderTextColor',
  'tintColor',
];
const STYLE_COLOR_KEYS = [
  'color',
  'backgroundColor',
  'borderColor',
  'tintColor',
];
// 다크 렌더에 라이트 회색이 남으면 테마를 안 따른 색이다. 다크 스케일과 값이 겹치는 것(라이트 200 = 다크 900)은 뺀다 —
// 900(#101828)도 fixed-900 과 같아 고정색 자리에 정당하게 쓰여 뺀다.
const darkValues = new Set(
  Object.values(dark.gray as Record<string, string>).map(v => v.toLowerCase()),
);
const LIGHT_GRAYS: string[] = Object.entries(
  light.gray as Record<string, string>,
)
  .filter(([step]) => step !== '900')
  .map(([, v]) => v.toLowerCase())
  .filter(v => !darkValues.has(v));

const colorsIn = (tree: Tree): string[] => {
  const out: string[] = [];
  for (const node of tree.root.findAll(() => true, {deep: true})) {
    const p = node.props as Record<string, unknown>;
    for (const key of COLOR_PROPS) {
      if (typeof p[key] === 'string') out.push(p[key] as string);
    }
    const style = RN.StyleSheet.flatten(
      p.style as RN.StyleProp<RN.ViewStyle & RN.TextStyle>,
    );
    if (style) {
      for (const key of STYLE_COLOR_KEYS) {
        const v = (style as Record<string, unknown>)[key];
        if (typeof v === 'string') out.push(v);
      }
    }
  }
  return out.map(c => c.toLowerCase());
};

const metrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 47, left: 0, right: 0, bottom: 34},
};

describe.each(Object.entries(DEMOS))('놀이터 데모 %s', (_id, Demo) => {
  it.each(['light', 'dark'] as const)('%s 에서 그려진다', theme => {
    scheme = theme;
    const tree = render(
      <SafeAreaProvider initialMetrics={metrics}>
        <Demo />
      </SafeAreaProvider>,
    );
    expect(tree.toJSON()).not.toBeNull();
    if (theme === 'dark') {
      expect(colorsIn(tree).filter(c => LIGHT_GRAYS.includes(c))).toEqual([]);
    }
    ReactTestRenderer.act(() => tree.unmount());
  });
});
