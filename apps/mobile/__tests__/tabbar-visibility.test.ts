/**
 * 탭바 표시 상태. 3곳이 맞물려 있어 한 곳만 고치면 다른 쪽이 깨진다
 * (hideCount · 내비게이터 clip · 화면 패딩).
 *
 * 이 파일은 그 계약을 소스 텍스트로 고정한다 — 실제 훅은 네비게이션
 * 컨텍스트가 필요해 단독 렌더가 안 된다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const hook = read('src/shared/hooks/useHideTabBar.ts');
const navigator = read(
  'src/navigations/tab/createNativeBottomTabNavigator.tsx',
);
const home = read('src/screens/home/HomeScreen.tsx');

describe('hideCount 는 카운터다', () => {
  it('boolean 이 아니라 숫자 — (다음 focus)→(이전 cleanup) 순서 때문', () => {
    expect(hook).toContain('hideCount = {current: 0}');
    expect(hook).toContain('setHideCount(hideCount.current + 1)');
    expect(hook).toContain('setHideCount(hideCount.current - 1)');
  });

  it('음수로 내려가지 않는다', () => {
    expect(hook).toContain('Math.max(0, next)');
  });
});

describe('★탭 루트는 hideCount 를 구독한다', () => {
  it('한 번만 확인하지 않는다 — 탭 왕복 중 변화를 놓치면 영구히 사라진다', () => {
    // 타이머 한 발로 끝내면 타이밍이 어긋난 순간 탭바가 안 돌아온다.
    expect(hook).toContain('subscribeHideCount');
    expect(hook).toContain('useShowTabBar');
  });

  it('홈은 setTabBarVisible 을 직접 부르지 않는다', () => {
    expect(home).toContain('useShowTabBar()');
    // 주석에는 등장할 수 있으므로 import 여부로 판정한다.
    expect(home).not.toMatch(/^import .*setTabBarVisible/m);
  });
});

describe('★clip 패딩은 내비게이터와 같은 조건이어야 한다', () => {
  it('내비게이터는 display:none && tabBarClipWhenHidden 일 때만 자른다', () => {
    expect(navigator).toContain("display === 'none'");
    expect(navigator).toContain('tabBarClipWhenHidden');
  });

  it('패딩도 hideCount 를 본다(tabBarVisible 만으로는 부족)', () => {
    expect(hook).toContain('useHiddenTabBarClipPadding');
    expect(hook).toContain('!hiding');
  });

  it('★hideCount 를 구독한다 — 렌더 중 직접 읽으면 한 프레임 늦다', () => {
    // 그냥 읽으면 값이 바뀌어도 리렌더가 안 돌아 "여백이 생겼다 사라진다".
    expect(hook).toContain('useSyncExternalStore');
  });

  it('양쪽이 같은 getTabBarClipPx 를 쓴다', () => {
    expect(navigator).toContain('getTabBarClipPx');
    expect(hook).toContain('getTabBarClipPx');
  });
});

export {};
