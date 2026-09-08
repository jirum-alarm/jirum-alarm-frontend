export {};

/**
 * 탭바 알림 점(빨간 뱃지) 판정.
 *
 * 실측 버그: 점이 **영구히 꺼져 있었다.** 값을 밀어넣던 유일한 경로가 웹뷰
 * 브릿지(`ALARM_DOT_CHANGED`)였고, 그 송신자인 web `BottomNav` 는 앱에서
 * `isJirumAlarmApp` 조기 반환에 걸려 렌더 자체가 안 됐다 → 브릿지가 앱에
 * 한 번도 오지 않았다. 판정을 네이티브가 소유하도록 옮겼으므로, 여기서는
 * **판정 규칙 자체**를 런타임으로 고정한다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const store: Record<string, string> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (k: string) => store[k] ?? null),
  setItem: jest.fn(async (k: string, v: string) => {
    store[k] = v;
  }),
  removeItem: jest.fn(async (k: string) => {
    delete store[k];
  }),
}));

const {
  NO_SNAPSHOT,
  getAlarmUnreadSnapshot,
  setAlarmUnreadSnapshot,
  hydrateAlarmUnreadSnapshot,
  subscribeAlarmUnreadSnapshot,
} = require('../src/shared/lib/alarm-unread-snapshot');
const {decideHasNewAlarm} = require('../src/shared/hooks/useHasNewAlarm');

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

describe('점 판정 — 미읽음 > 0 이 아니라 "본 뒤로 늘었나"', () => {
  it('아직 알림함을 안 봤으면(스냅샷 없음) 미읽음이 있으면 켠다', () => {
    expect(decideHasNewAlarm(1, NO_SNAPSHOT)).toBe(true);
    expect(decideHasNewAlarm(7, NO_SNAPSHOT)).toBe(true);
  });

  it('스냅샷이 없고 미읽음도 없으면 끈다', () => {
    expect(decideHasNewAlarm(0, NO_SNAPSHOT)).toBe(false);
  });

  /**
   * ★가장 중요한 케이스. 안 읽고 남겨둔 알림 3건이 있는 상태로 알림함을 열면
   * 스냅샷 3 이 박히고 점은 꺼진다. 단순히 `unreadCount > 0` 으로 켜면
   * 이 사용자는 점을 영구히 보게 되고 점이 신호 역할을 못 한다.
   */
  it('본 뒤로 안 늘었으면 미읽음이 남아 있어도 끈다', () => {
    expect(decideHasNewAlarm(3, 3)).toBe(false);
    expect(decideHasNewAlarm(2, 3)).toBe(false); // 다른 기기에서 읽어 줄어든 경우
  });

  it('본 뒤로 늘었으면 켠다', () => {
    expect(decideHasNewAlarm(4, 3)).toBe(true);
    expect(decideHasNewAlarm(1, 0)).toBe(true);
  });
});

describe('스냅샷 저장 — 알림함을 보면 꺼진다', () => {
  beforeEach(async () => {
    for (const k of Object.keys(store)) delete store[k];
  });

  it('알림함을 본 시점의 미읽음 수를 기준선으로 박으면 점이 꺼진다', () => {
    setAlarmUnreadSnapshot(NO_SNAPSHOT); // 안 본 상태로 되돌린다
    expect(decideHasNewAlarm(3, getAlarmUnreadSnapshot())).toBe(true);

    setAlarmUnreadSnapshot(3); // 알림함 방문
    expect(decideHasNewAlarm(3, getAlarmUnreadSnapshot())).toBe(false);

    // 새 알림 1건 도착
    expect(decideHasNewAlarm(4, getAlarmUnreadSnapshot())).toBe(true);
  });

  it('기준선은 앱을 다시 켜도 남는다(AsyncStorage 미러링)', async () => {
    setAlarmUnreadSnapshot(5);
    // 디스크 쓰기는 fire-and-forget 이라 한 틱 기다린다
    await Promise.resolve();
    expect(Object.values(store)).toContain('5');
  });

  it('구독자에게 변경을 알린다(useSyncExternalStore 소스)', () => {
    const listener = jest.fn();
    const unsubscribe = subscribeAlarmUnreadSnapshot(listener);
    setAlarmUnreadSnapshot(9);
    expect(listener).toHaveBeenCalled();
    unsubscribe();
    setAlarmUnreadSnapshot(10);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('hydrate 는 이번 실행에서 이미 박은 기준선을 덮지 않는다', async () => {
    store.alarmUnreadCountAfterRead = '1';
    setAlarmUnreadSnapshot(8); // 방금 알림함을 봤다
    await hydrateAlarmUnreadSnapshot();
    // 디스크의 낡은 1 로 되돌아가면 점이 다시 켜진다
    expect(getAlarmUnreadSnapshot()).toBe(8);
  });
});

describe('★배선 — 판정이 네이티브 소유인가(브릿지 회귀 방지)', () => {
  const hook = read('src/shared/hooks/useHasNewAlarm.ts');
  const sync = read('src/shared/hooks/useAlarmDotSync.ts');
  const mainNavigator = read('src/navigations/stack/MainNavigator.tsx');
  const viewModel = read(
    'src/screens/alarm/model/useNotificationsViewModel.ts',
  );
  const event = read('src/shared/lib/webview/event.ts');
  const bridge = read('src/shared/lib/webview/bridge.ts');

  const stripComments = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');

  /**
   * ⚠️값을 밖에서 밀어넣는 setter 가 다시 생기면 같은 버그가 재발한다
   * (송신자가 없어도 tsc·lint 는 통과한다 — 조용한 실패였다).
   */
  it('외부 주입 setter(setHasNewAlarm)가 없다', () => {
    // ⚠️주석이 "왜 없앴는지" 설명하며 이름을 언급한다 — 코드에서만 찾는다.
    expect(stripComments(hook)).not.toMatch(/setHasNewAlarm/);
  });

  it('미읽음 수와 스냅샷으로 스스로 계산한다', () => {
    expect(hook).toMatch(/useUnreadNotifications/);
    expect(hook).toMatch(/getAlarmUnreadSnapshot/);
  });

  it('브릿지 수신부도 지웠다 — 되살리면 네이티브 판정을 덮어쓴다', () => {
    expect(stripComments(event)).not.toMatch(/ALARM_DOT_CHANGED/);
    expect(stripComments(bridge)).not.toMatch(/ALARM_DOT_CHANGED/);
  });

  it('web 송신부도 지웠다', () => {
    const webBottomNav = fs.readFileSync(
      path.join(__dirname, '../../web/src/shared/ui/layout/BottomNav.tsx'),
      'utf8',
    );
    expect(stripComments(webBottomNav)).not.toMatch(/ALARM_DOT_CHANGED/);
  });

  it('미읽음 수를 네이티브가 직접 쿼리한다(있는 쿼리 재사용)', () => {
    expect(sync).toMatch(/NotificationQueries\.unreadCount\(\)/);
    expect(sync).toMatch(/setUnreadCount\(/);
  });

  it('포그라운드 복귀 시 재조회한다(AppState — 토큰 갱신과 같은 패턴)', () => {
    expect(sync).toMatch(/AppState\.addEventListener\('change'/);
    expect(sync).toMatch(/inactive\|background/);
    expect(sync).toMatch(/invalidateQueries/);
  });

  /** 알림 탭을 한 번도 안 열어도 점은 떠야 하므로 탭 화면 밖에 마운트한다. */
  it('동기화 훅이 MainNavigator 에 매달려 있다', () => {
    expect(mainNavigator).toMatch(/useAlarmDotSync\(\)/);
  });

  it('알림함 방문(focus)과 읽음/삭제 뒤 기준선을 갱신한다', () => {
    expect(viewModel).toMatch(/useFocusEffect/);
    expect(viewModel).toMatch(/setAlarmUnreadSnapshot\(/);
  });

  /** 기존 iOS 배지 처리는 건드리지 않았다(없으면 unhandled rejection). */
  it('iOS 배지 가드는 그대로다', () => {
    expect(viewModel).toMatch(/Platform\.OS === 'ios'/);
    expect(viewModel).toMatch(/setBadgeCountAsync\([\s\S]{0,40}\)\.catch/);
  });
});
