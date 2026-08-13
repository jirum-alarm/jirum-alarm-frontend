jest.mock('expo-glass-effect', () => ({
  isLiquidGlassAvailable: jest.fn(() => false),
}));

import {Platform} from 'react-native';
import {isLiquidGlassAvailable} from 'expo-glass-effect';
import {
  GLASS_BOTTOM_GAP,
  JS_TAB_BAR_FALLBACK_INSET,
  JS_TAB_BAR_HEIGHT,
  SYSTEM_TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT,
  buildNativeTabsInjectJs,
  getFabPaddingPx,
  getReservedBottomPx,
  getWebBottomNavVars,
} from '../src/navigations/tab/tab-bar-metrics';

const mockLiquidGlass = isLiquidGlassAvailable as jest.MockedFunction<
  typeof isLiquidGlassAvailable
>;

function setIosVersion(version: string) {
  Object.defineProperty(Platform, 'OS', {
    configurable: true,
    get: () => 'ios',
  });
  Object.defineProperty(Platform, 'Version', {
    configurable: true,
    value: version,
  });
}

describe('getReservedBottomPx', () => {
  it('JS 탭바(안드로이드·구 iOS)는 56 + safe-area — 0 이면 콘텐츠가 탭바 밑으로 들어간다', () => {
    mockLiquidGlass.mockReturnValue(false);
    setIosVersion('17.5');
    expect(getReservedBottomPx(34)).toBe(JS_TAB_BAR_HEIGHT + 34);
  });

  it('JS 탭바 inset 이 0 이면 바닥 8px', () => {
    mockLiquidGlass.mockReturnValue(false);
    Object.defineProperty(Platform, 'OS', {
      configurable: true,
      get: () => 'android',
    });
    expect(getReservedBottomPx(0)).toBe(
      JS_TAB_BAR_HEIGHT + JS_TAB_BAR_FALLBACK_INSET,
    );
  });

  it('iOS 26 시스템 탭바는 콘텐츠 높이 + safe-area 만 비운다 — 커스텀 캡슐 간격을 더하면 FAB 가 뜬다', () => {
    mockLiquidGlass.mockReturnValue(false);
    setIosVersion('26.5');
    expect(getReservedBottomPx(34)).toBe(SYSTEM_TAB_BAR_HEIGHT + 34);
  });

  it('리퀴드 글라스면 탭바 + safe-area + 띄운 간격', () => {
    mockLiquidGlass.mockReturnValue(true);
    setIosVersion('17.5');
    expect(getReservedBottomPx(34)).toBe(
      TAB_BAR_HEIGHT + 34 + GLASS_BOTTOM_GAP,
    );
  });

  it('오버레이인데 safe-area 가 0 이면 바닥 간격으로 대체한다', () => {
    mockLiquidGlass.mockReturnValue(true);
    setIosVersion('26.5');
    expect(getReservedBottomPx(0)).toBe(
      SYSTEM_TAB_BAR_HEIGHT + GLASS_BOTTOM_GAP,
    );
  });
});

describe('getFabPaddingPx', () => {
  it('iOS 26 은 캡슐 높이만 — safe-area 를 더하면 글쓰기 버튼이 뜬다', () => {
    mockLiquidGlass.mockReturnValue(false);
    setIosVersion('26.5');
    expect(getFabPaddingPx(34)).toBe(SYSTEM_TAB_BAR_HEIGHT + GLASS_BOTTOM_GAP);
    expect(getFabPaddingPx(34)).toBeLessThan(getReservedBottomPx(34));
  });

  it('JS 탭바 FAB 도 탭바 높이만큼 — 0 이면 글쓰기 버튼이 탭바와 겹친다', () => {
    mockLiquidGlass.mockReturnValue(false);
    setIosVersion('17.5');
    expect(getFabPaddingPx(34)).toBe(JS_TAB_BAR_HEIGHT + 34);
  });
});

describe('getWebBottomNavVars', () => {
  it('탭바가 보이면 reserved 높이를 쓰고, chrome 은 safe-area 를 다시 넣지 않는다', () => {
    expect(
      getWebBottomNavVars({
        tabBarVisible: true,
        reservedBottomPx: 110,
        safeAreaBottom: 34,
        fabPaddingPx: 61,
      }),
    ).toEqual({
      paddingPx: 110,
      chromePadding: '0.75rem',
      fabPaddingPx: 61,
      fabGap: '8px',
    });
  });

  it('탭바를 숨기면 padding 0, chrome 이 inset 을 맡는다', () => {
    expect(
      getWebBottomNavVars({
        tabBarVisible: false,
        reservedBottomPx: 110,
        safeAreaBottom: 34,
        fabPaddingPx: 61,
      }),
    ).toEqual({
      paddingPx: 0,
      chromePadding: '34px',
      fabPaddingPx: 0,
      fabGap: '1rem',
    });
  });

  it('웹뷰 안 상세는 clip 높이만큼 올리지 않는다 — 올리면 입력창 아래가 빈다', () => {
    expect(
      getWebBottomNavVars({
        tabBarVisible: false,
        reservedBottomPx: 110,
        safeAreaBottom: 34,
        fabPaddingPx: 61,
      }).paddingPx,
    ).toBe(0);
  });

  it('FAB 는 목록 여백보다 낮게 — 목록 여백을 그대로 쓰면 글쓰기 버튼이 뜬다', () => {
    const vars = getWebBottomNavVars({
      tabBarVisible: true,
      reservedBottomPx: 83,
      safeAreaBottom: 34,
      fabPaddingPx: 61,
    });
    expect(vars.fabPaddingPx).toBeLessThan(vars.paddingPx);
    expect(vars.fabGap).toBe('8px');
  });

  it('inset 이 0 이어도 chrome 은 최소 12px', () => {
    expect(
      getWebBottomNavVars({
        tabBarVisible: false,
        reservedBottomPx: 0,
        safeAreaBottom: 0,
        fabPaddingPx: 0,
      }),
    ).toEqual({
      paddingPx: 0,
      chromePadding: '12px',
      fabPaddingPx: 0,
      fabGap: '1rem',
    });
  });
});

describe('buildNativeTabsInjectJs', () => {
  it('스타일이 이미 있어도 값을 덮어쓴다 (SPA 이동)', () => {
    const js = buildNativeTabsInjectJs({
      paddingPx: 0,
      chromePadding: '34px',
      fabPaddingPx: 0,
      fabGap: '1rem',
    });
    expect(js).not.toMatch(
      /if \(document\.getElementById\(STYLE_ID\)\) \{ return; \}/,
    );
    expect(js).toContain('style.textContent');
    expect(js).toContain('--bottom-nav-padding: 0px');
    expect(js).toContain('--bottom-chrome-padding: 34px');
  });
});
