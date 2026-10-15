/**
 * 스와이프한 뒤 카드를 누르면 바로 열리는가 — patches/react-native@0.86.3.patch 가 살아 있는지.
 *
 * RN ScrollView 는 관성 시작~끝 이벤트가 JS 에 도착할 때까지 모든 탭을 가로채(=스크롤 멈추기로만 쓰고)
 * 자식 버튼에 주지 않았다. 눈으로는 멈췄는데(스냅 꼬리·안드로이드 정지 판정·JS 밀림) 첫 탭이 버려졌고,
 * iOS 는 탭으로 멈추면 관성 끝 이벤트가 아예 안 와서 다음 탭들까지 버려질 수 있었다.
 * 패치는 «눈에 보이게 빨리 움직일 때»만 가로챈다. 프리셋 목 대신 진짜 ScrollView 를 그려 핸들러를 직접 부른다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.unmock('react-native/Libraries/Components/ScrollView/ScrollView');

import {ScrollView} from 'react-native';

type Handlers = {
  onMomentumScrollBegin: (e: unknown) => void;
  onMomentumScrollEnd: (e: unknown) => void;
  onScroll: (e: unknown) => void;
  onStartShouldSetResponderCapture: (e: unknown) => boolean;
  onResponderGrant: (e: unknown) => void;
  onResponderRelease: (e: unknown) => void;
};

function renderHorizontal(): Handlers {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<ScrollView horizontal />);
  });
  const host = renderer.root.find(
    node =>
      typeof node.type === 'string' &&
      typeof node.props.onStartShouldSetResponderCapture === 'function',
  );
  return host.props as Handlers;
}

const tap = {target: {}, nativeEvent: {touches: []}};
const scrollAt = (x: number, timestamp: number) => ({
  nativeEvent: {contentOffset: {x, y: 0}, timestamp},
});

describe('ScrollView 관성 중 탭 (jirum patch)', () => {
  it('빠르게 날아가는 중의 탭은 멈추기로만 쓴다', () => {
    const sv = renderHorizontal();
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(0, 1000));
    sv.onScroll(scrollAt(40, 1016)); // 2.5px/ms
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(true);
  });

  it('관성 꼬리(느림)의 탭은 자식 버튼에게 간다', () => {
    const sv = renderHorizontal();
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(0, 1000));
    sv.onScroll(scrollAt(40, 1016));
    sv.onScroll(scrollAt(44, 1032)); // 0.25px/ms — 눈으로는 거의 멈춤
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(false);
  });

  it('관성 끝 이벤트를 막 받은 직후의 탭도 자식에게 간다(원본은 16ms 동안 가로챘다)', () => {
    const sv = renderHorizontal();
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(0, 1000));
    sv.onScroll(scrollAt(40, 1016));
    sv.onMomentumScrollEnd({nativeEvent: {}});
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(false);
  });

  it('탭으로 멈춘 뒤엔 관성 끝 이벤트가 안 와도 다음 탭이 자식에게 간다(iOS)', () => {
    const sv = renderHorizontal();
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(0, 1000));
    sv.onScroll(scrollAt(40, 1016));
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(true);
    sv.onResponderGrant(tap);
    sv.onResponderRelease(tap);
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(false);
  });

  it('손 떼며 새로 던졌으면(관성 시작이 먼저 도착) 그 관성은 살아 있다', () => {
    const sv = renderHorizontal();
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(0, 1000));
    sv.onScroll(scrollAt(40, 1016));
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(true);
    sv.onResponderGrant(tap);
    sv.onMomentumScrollBegin({nativeEvent: {}});
    sv.onScroll(scrollAt(80, 1032));
    sv.onResponderRelease(tap);
    expect(sv.onStartShouldSetResponderCapture(tap)).toBe(true);
  });
});
