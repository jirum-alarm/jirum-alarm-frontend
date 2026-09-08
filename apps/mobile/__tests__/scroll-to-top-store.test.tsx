export {};
/**
 * 재탭 → 맨 위로.
 *
 * ★ 이 자리는 조용히 죽어 있던 곳이다: 웹뷰 시절 재탭은
 * `getWebViewRef(tab)?.current?.injectJavaScript(...)` 였고, 네이티브로 옮긴
 * 홈·알림 탭엔 웹뷰 ref 가 없어 optional chaining 이 예외도 로그도 없이
 * 삼켰다(그래서 "재탭해도 안 올라간다"가 아무 신호 없이 방치됐다).
 * 등록소가 있는지/폴백보다 먼저 시도되는지 두 축으로 못박는다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

import {
  scrollTabToTop,
  useRegisterScrollToTop,
} from '../src/navigations/tab/scroll-to-top-store';
import {tabNavigations} from '../src/shared/constant/navigations';

type TabName = (typeof tabNavigations)[keyof typeof tabNavigations];

/** 화면이 마운트되면 자기 콜백을 등록하는 최소 화면. */
function Screen({tab, onScroll}: {tab: TabName; onScroll: () => void}) {
  useRegisterScrollToTop(tab, onScroll);
  return null;
}

function mount(tab: TabName, onScroll: () => void) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<Screen tab={tab} onScroll={onScroll} />);
  });
  return tree;
}

describe('scroll-to-top-store', () => {
  it('등록 안 된 탭은 false — 부른 쪽이 웹뷰 주입으로 폴백해야 한다', () => {
    expect(scrollTabToTop(tabNavigations.COMMUNITY)).toBe(false);
  });

  it('등록된 탭은 콜백을 실행하고 true', () => {
    const onScroll = jest.fn();
    const tree = mount(tabNavigations.HOME, onScroll);

    expect(scrollTabToTop(tabNavigations.HOME)).toBe(true);
    expect(onScroll).toHaveBeenCalledTimes(1);

    ReactTestRenderer.act(() => tree.unmount());
  });

  it('언마운트되면 해제된다 — 죽은 화면의 ref 를 잡고 있으면 안 된다', () => {
    const onScroll = jest.fn();
    const tree = mount(tabNavigations.ALARM, onScroll);
    ReactTestRenderer.act(() => tree.unmount());

    expect(scrollTabToTop(tabNavigations.ALARM)).toBe(false);
    expect(onScroll).not.toHaveBeenCalled();
  });

  it('탭마다 따로다 — 한 탭 등록이 다른 탭을 대신 처리하지 않는다', () => {
    const home = jest.fn();
    const tree = mount(tabNavigations.HOME, home);

    expect(scrollTabToTop(tabNavigations.MYPAGE)).toBe(false);
    expect(home).not.toHaveBeenCalled();

    ReactTestRenderer.act(() => tree.unmount());
  });

  it('탭당 하나만 남는다 — 상세가 쌓여도 루트 화면 콜백이 유지된다', () => {
    const first = jest.fn();
    const second = jest.fn();
    const a = mount(tabNavigations.HOME, first);
    const b = mount(tabNavigations.HOME, second);

    // 뒤에 마운트된 쪽이 자리를 갖는다(등록은 탭당 1개).
    expect(scrollTabToTop(tabNavigations.HOME)).toBe(true);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();

    // 나중 것이 사라져도 먼저 것이 자리를 되찾지는 않지만, 남아 있는 등록을
    // 남의 언마운트가 지우지도 않는다 — 순서가 역전돼도 자기 것만 지운다.
    ReactTestRenderer.act(() => a.unmount());
    expect(scrollTabToTop(tabNavigations.HOME)).toBe(true);
    expect(second).toHaveBeenCalledTimes(2);

    ReactTestRenderer.act(() => b.unmount());
    expect(scrollTabToTop(tabNavigations.HOME)).toBe(false);
  });
});

/**
 * 순서 가드. store 를 웹뷰 주입 **뒤에** 두면 홈·알림은 여전히 안 올라간다
 * (앞의 injectJavaScript 가 no-op 으로 조용히 성공해 return 해버리므로).
 */
describe('MainTabNavigator 재탭 처리 순서', () => {
  // ⚠️@types/node 가 없어 top-level import 는 tsc 가 죽는다 → 인라인 require.
  const readNavigator = (): string => {
    const nodeFs = require('fs');

    const nodePath = require('path');
    return nodeFs.readFileSync(
      nodePath.join(
        __dirname,
        '..',
        'src/navigations/tab/MainTabNavigator.tsx',
      ),
      'utf8',
    ) as string;
  };

  it('handleScrollToTop 이 웹뷰 주입보다 먼저 store 를 시도한다', () => {
    const src = readNavigator();
    const start = src.indexOf('const handleScrollToTop');
    const end = src.indexOf('const handleNavigateToRoot');
    expect(start).toBeGreaterThan(-1);
    expect(end).toBeGreaterThan(start);

    const block = src.slice(start, end);
    const storeAt = block.indexOf('scrollTabToTop(tabName)');
    const injectAt = block.indexOf('injectJavaScript');
    expect(storeAt).toBeGreaterThan(-1);
    expect(injectAt).toBeGreaterThan(-1);
    expect(storeAt).toBeLessThan(injectAt);
  });

  it('네이티브 화면들이 자기 탭 이름으로 등록한다', () => {
    const nodeFs = require('fs');

    const nodePath = require('path');
    const read = (rel: string) =>
      nodeFs.readFileSync(
        nodePath.join(__dirname, '..', rel),
        'utf8',
      ) as string;

    const home = read('src/screens/home/HomeScreen.tsx');
    expect(home).toContain(
      'useRegisterScrollToTop(tabNavigations.HOME, scrollToTop)',
    );

    const alarm = read('src/screens/alarm/AlarmScreen.tsx');
    expect(alarm).toContain(
      'useRegisterScrollToTop(tabNavigations.ALARM, scrollToTop)',
    );
    // FlatList 에 ref 가 안 붙으면 콜백이 영원히 no-op 이다.
    expect(alarm).toContain('ref={listRef}');
  });
});
