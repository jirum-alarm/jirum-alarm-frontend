export {};

/**
 * 로그아웃·회원탈퇴가 **웹뷰가 대신 해주던 일을 인수했는지** 실제로 돌려서 확인한다.
 *
 * 웹뷰 시절: web `useLogout` → `TOKEN_REMOVE` 브릿지 → `AuthBridge.tokenRemove`
 * → `useTokenRemoveEffect`(웹뷰 화면에 붙어 있음)가 토큰을 지웠다.
 * 내정보가 네이티브가 되면 그 화면이 없어 **브릿지를 흉내내도 아무 일이 안 난다.**
 * 증상이 UI 누락이 아니라 "로그아웃했는데 세션이 남는 것"이라 눈으로도, 타입으로도,
 * 소스텍스트 검사로도 안 잡힌다 → 런타임 계약으로 못박는다.
 */

import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import CookieManager from '@react-native-cookies/cookies';
import * as Notifications from 'expo-notifications';

import {StorageKey} from '../src/shared/constant/storage-key';
import {removeAsyncStorage} from '../src/shared/lib/persistence';

jest.mock('@react-native-cookies/cookies', () => ({
  __esModule: true,
  default: {clearAll: jest.fn(() => Promise.resolve(true))},
}));

jest.mock('expo-notifications', () => ({
  setBadgeCountAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('../src/shared/lib/persistence', () => ({
  removeAsyncStorage: jest.fn(() => Promise.resolve()),
  setAsyncStorage: jest.fn(() => Promise.resolve()),
  getAsyncStorage: jest.fn(() => Promise.resolve(null)),
}));

import {useLogout} from '../src/features/mypage/model/useLogout';
import {MyPageQueries} from '../src/entities/mypage';
import {ThemeQueries} from '../src/entities/theme';
import {AuthQueries} from '../src/entities/auth';
import {
  getUnreadCount,
  setUnreadCount,
} from '../src/shared/hooks/useUnreadNotifications';

const mockClearAll = CookieManager.clearAll as jest.Mock;
const mockSetBadge = Notifications.setBadgeCountAsync as jest.Mock;
const mockRemoveAsyncStorage = removeAsyncStorage as jest.Mock;

/**
 * react-query 를 통째로 mock 해서 removeQueries/invalidateQueries 호출만 본다.
 * ⚠️jest.mock 팩토리는 스코프 밖 변수를 못 읽는다 — `mock` 접두사가 붙은 것만
 * 예외라 이름을 그렇게 둔다(이 레포 jest 함정).
 */
const mockRemoveQueries = jest.fn();
const mockInvalidateQueries = jest.fn(() => Promise.resolve());
jest.mock('@tanstack/react-query', () => ({
  queryOptions: (options: unknown) => options,
  infiniteQueryOptions: (options: unknown) => options,
  useQueryClient: () => ({
    removeQueries: mockRemoveQueries,
    invalidateQueries: mockInvalidateQueries,
  }),
}));

let logout: (() => Promise<void>) | undefined;

function LogoutConsumer() {
  logout = useLogout();
  return null;
}

async function runLogout() {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<LogoutConsumer />);
  });
  await ReactTestRenderer.act(async () => {
    await logout?.();
  });
}

describe('useLogout — 인수한 부수효과 5가지', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setUnreadCount(7);
  });

  it('① AsyncStorage 의 access·refresh 토큰을 지운다', async () => {
    await runLogout();
    const keys = mockRemoveAsyncStorage.mock.calls.map(call => call[0]);
    expect(keys).toContain(StorageKey.ACCESS_TOKEN);
    expect(keys).toContain(StorageKey.REFRESH_TOKEN);
  });

  /**
   * ★쿠키를 안 지우면 커뮤니티 탭 웹뷰가 계속 로그인 상태로 보인다
   * (`useAuth` 가 WebView 용으로 심어둔 ACCESS_TOKEN/REFRESH_TOKEN 쿠키).
   */
  it('② 쿠키 저장소를 **두 벌 다** 비운다(iOS)', async () => {
    await runLogout();
    /**
     * ★처음엔 `toHaveBeenCalled()` 로만 봤는데, 두 호출 중 하나를 지워도
     * 테스트가 통과했다(되돌려 실패시키는 확인에서 잡혔다).
     * iOS 는 NSHTTPCookieStorage(useWebKit=false)와 WKWebsiteDataStore(true)가
     * 따로다 — `useAuth` 는 앞쪽에 심고 WebView 는 뒤쪽을 읽으므로
     * **한쪽만 지우면 웹뷰가 로그인 상태로 남는다.** 인자까지 못박는다.
     */
    const args = mockClearAll.mock.calls.map(call => call[0]);
    expect(args).toContain(undefined);
    expect(args).toContain(true);
  });

  it('③ 앱 아이콘 배지와 미읽음 수를 0 으로 내린다', async () => {
    await runLogout();
    expect(mockSetBadge).toHaveBeenCalledWith(0);
    expect(getUnreadCount()).toBe(0);
  });

  it('④ 개인 캐시(내정보·묶음)를 버린다', async () => {
    await runLogout();
    const removed = mockRemoveQueries.mock.calls.map(call => call[0]?.queryKey);
    expect(removed).toContainEqual(MyPageQueries.keys.all);
    expect(removed).toContainEqual(ThemeQueries.keys.all);
  });

  /**
   * ★★가장 중요한 한 줄. `RootNavigator` 는 `useAuth`(= loginByRefreshToken
   * 쿼리)로 로그인 여부를 가른다. 이걸 무효화하지 않으면 토큰을 다 지워도
   * **화면이 그대로 남는다** — web 의 `location.replace('/')` 대응이다.
   */
  it('⑤ loginByRefreshToken 을 무효화해 RootNavigator 를 로그인 화면으로 돌린다', async () => {
    await runLogout();
    const invalidated = mockInvalidateQueries.mock.calls.map(
      (call: unknown[]) => (call[0] as {queryKey?: unknown})?.queryKey,
    );
    expect(invalidated).toContainEqual(AuthQueries.keys.loginByRefreshToken());
  });

  /** 정리 하나가 실패해도 ⑤(화면 전환)는 반드시 돈다. */
  it('쿠키 삭제가 실패해도 세션 무효화까지 도달한다', async () => {
    mockClearAll.mockRejectedValueOnce(new Error('boom'));
    await runLogout();
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});

describe('회원탈퇴 — 성공하면 로그아웃 경로를 그대로 탄다', () => {
  /**
   * 서버에서 계정이 지워졌는데 토큰·쿠키가 남으면 앱은 로그인 상태처럼 굴다가
   * 모든 요청이 401 로 죽는다. web `DeleteAccount` 도 `logout()` 을 부른다.
   * (뮤테이션 전체를 돌리려면 QueryClientProvider 가 필요해, 여기서는 배선만 본다 —
   * 실제 정리 동작은 위 5가지가 이미 실행으로 보장한다.)
   */
  it('useWithdraw 의 onSuccess 가 useLogout 을 호출한다', () => {
    const fsLocal = require('fs');
    const pathLocal = require('path');
    const source = fsLocal.readFileSync(
      pathLocal.join(__dirname, '../src/features/mypage/model/mutations.ts'),
      'utf8',
    );
    expect(source).toContain('const logout = useLogout()');
    expect(source).toMatch(/mutationFn: MyPageService\.withdraw/);
    expect(source).toMatch(/onSuccess: \(\) => logout\(\)/);
  });
});
