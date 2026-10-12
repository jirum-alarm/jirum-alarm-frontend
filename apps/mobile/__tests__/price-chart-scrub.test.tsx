/**
 * 가격 차트 스크럽 — 손가락이 점을 옮길 때 다시 그리는 건 고른 점 표시뿐이어야 한다.
 *
 * 예전엔 고른 점이 점 목록 안의 r·fill 로 섞여 있어, 점이 바뀔 때마다 눈금·면·선·점 전부(1년이면
 * 점 수백 개)를 SVG 로 다시 만들었다. 같은 점 위에서 손가락이 떨려도 초당 60번 부모 state 를 갱신했다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

// SVG 는 그린 횟수만 센다.
const mockDrawn: Record<string, number> = {};
jest.mock('react-native-svg', () => {
  const R = require('react');
  const make = (name: string) => (props: {children?: React.ReactNode}) => {
    mockDrawn[name] = (mockDrawn[name] ?? 0) + 1;
    return R.createElement(R.Fragment, null, props.children);
  };
  const Svg = make('Svg');
  return {
    __esModule: true,
    default: Svg,
    Circle: make('Circle'),
    Defs: make('Defs'),
    G: make('G'),
    Line: make('Line'),
    LinearGradient: make('LinearGradient'),
    Path: make('Path'),
    Stop: make('Stop'),
    Text: make('Text'),
  };
});

// 제스처 콜백을 꺼내 손으로 부른다.
type PanHandlers = {
  onBegin?: (e: {x: number}) => void;
  onUpdate?: (e: {x: number}) => void;
};
let mockPan: PanHandlers = {};
jest.mock('react-native-gesture-handler', () => {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  Object.assign(chain, {
    runOnJS: self,
    activeOffsetX: self,
    failOffsetY: self,
    onBegin: (fn: PanHandlers['onBegin']) => {
      mockPan.onBegin = fn;
      return chain;
    },
    onUpdate: (fn: PanHandlers['onUpdate']) => {
      mockPan.onUpdate = fn;
      return chain;
    },
    onFinalize: self,
  });
  return {
    Gesture: {Pan: () => chain},
    GestureDetector: ({children}: {children: React.ReactNode}) => children,
  };
});

import {View} from 'react-native';
import PriceChart from '../src/features/price-history/ui/PriceChart';

const DAY = 24 * 60 * 60 * 1000;
const start = Date.UTC(2026, 0, 1);
const points = Array.from({length: 120}, (_, i) => ({
  date: new Date(start + i * DAY).toISOString().slice(0, 10),
  price: 10000 + ((i * 37) % 900),
}));

const reset = () => {
  for (const k of Object.keys(mockDrawn)) delete mockDrawn[k];
};

describe('PriceChart 스크럽', () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  afterEach(() => {
    ReactTestRenderer.act(() => renderer.unmount());
    mockPan = {};
  });

  const element = (selectedIndex: number | null, onSelect = jest.fn()) => (
    <PriceChart
      points={points}
      axisStartMs={start}
      axisEndMs={start + 120 * DAY}
      contentStartMs={start}
      contentEndMs={start + 119 * DAY}
      selectedIndex={selectedIndex}
      onSelectIndex={onSelect}
      currentMarker={null}
    />
  );

  it('점을 옮기면 고른 점 표시(원 1개)만 다시 그린다 — 점 120개는 그대로', () => {
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(element(null));
    });
    expect(mockDrawn.Circle).toBe(120);

    reset();
    ReactTestRenderer.act(() => renderer.update(element(5)));
    expect(mockDrawn.Circle).toBe(1);
    expect(mockDrawn.Path ?? 0).toBe(0);

    reset();
    ReactTestRenderer.act(() => renderer.update(element(6)));
    expect(mockDrawn.Circle).toBe(1);
  });

  it('같은 점 위에서 손가락이 떨리면 부모로 한 번만 올린다', () => {
    const onSelect = jest.fn();
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(element(null, onSelect));
    });
    // 폭을 알려 줘야 손가락 x → 점 index 를 계산한다.
    ReactTestRenderer.act(() => {
      renderer.root
        .findAllByType(View)[0]
        .props.onLayout({nativeEvent: {layout: {width: 640}}});
    });
    ReactTestRenderer.act(() => {
      mockPan.onBegin?.({x: 300});
      // 점 간격은 약 4.7px — 0.3px 안의 떨림은 같은 점이다.
      mockPan.onUpdate?.({x: 300.1});
      mockPan.onUpdate?.({x: 300.2});
      mockPan.onUpdate?.({x: 300.3});
    });
    expect(onSelect).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => mockPan.onUpdate?.({x: 400}));
    expect(onSelect).toHaveBeenCalledTimes(2);
  });

  it('다시 누르면(onBegin) 같은 점이어도 올린다 — 기간을 바꿔 선택이 지워진 뒤', () => {
    const onSelect = jest.fn();
    ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(element(null, onSelect));
    });
    ReactTestRenderer.act(() => {
      renderer.root
        .findAllByType(View)[0]
        .props.onLayout({nativeEvent: {layout: {width: 640}}});
    });
    ReactTestRenderer.act(() => {
      mockPan.onBegin?.({x: 300});
      mockPan.onBegin?.({x: 300});
    });
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});
