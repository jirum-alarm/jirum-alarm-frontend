/**
 * 관측 — 화면이 삼키는 쿼리 실패·OTA 비상 실행·화면 이름이 Sentry/GA4 에 남는가.
 *
 * 예전엔 setSentryUser 를 부르는 곳이 0곳, 화면 태그 없음, 쿼리 실패는 「다시 시도」 칸으로만
 * 보이고 어디에도 기록되지 않았다. OTA 가 기기에서 깨져 내장 번들로 되돌아가도 알 길이 없었다.
 */
import {CancelledError} from '@tanstack/react-query';

jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  setTag: jest.fn(),
  setUser: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  wrap: (c: unknown) => c,
  reactNavigationIntegration: jest.fn(() => ({
    name: 'ReactNavigation',
    registerNavigationContainer: jest.fn(),
  })),
}));

const mockUpdates: {
  isEmergencyLaunch: boolean;
  emergencyLaunchReason: string | null;
  isEmbeddedLaunch: boolean;
  updateId: string | null;
  channel: string | null;
} = {
  isEmergencyLaunch: false,
  emergencyLaunchReason: null,
  isEmbeddedLaunch: false,
  updateId: 'u1',
  channel: 'production',
};
jest.mock('expo-updates', () => mockUpdates);

// babel-preset-expo 가 process.env.EXPO_PUBLIC_* 를 이 모듈 읽기로 바꾼다.
const mockEnv: {EXPO_PUBLIC_SENTRY_DSN?: string} = {};
jest.mock('expo/virtual/env', () => ({env: mockEnv}));

const mockTrack = jest.fn();
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: (...args: unknown[]) => mockTrack(...args)},
}));

import {FetchError} from '../src/shared/lib/client';
import {queryErrorReportKey} from '../src/shared/lib/monitoring/query-errors';

type SentryModule = typeof import('../src/shared/lib/monitoring/sentry');
type SentrySdk = typeof import('@sentry/react-native');

// isolateModules 는 목·클래스도 새로 만든다 — 검사는 그 실행에서 쓰인 SDK 목으로, 에러는 그
// 실행의 FetchError 로 만든다(바깥 클래스로 만들면 instanceof 가 갈려 다른 원인으로 묶인다).
let Sentry: SentrySdk;
let IsolatedFetchError: typeof FetchError;

declare const global: {__DEV__: boolean};

/**
 * DSN 이 있는 상태로 sentry 모듈을 새로 읽는다(DSN 은 모듈 로드 때 읽힌다).
 * 릴리스 판정(__DEV__)은 호출 때마다 보므로 describe 의 before/after 가 잡고 있는다.
 */
const loadEnabledSentry = (): SentryModule => {
  mockEnv.EXPO_PUBLIC_SENTRY_DSN = 'https://key@example.ingest.sentry.io/1';
  let mod: SentryModule | undefined;
  jest.isolateModules(() => {
    mod = require('../src/shared/lib/monitoring/sentry');
    Sentry = require('@sentry/react-native');
    IsolatedFetchError = require('../src/shared/lib/client').FetchError;
  });
  delete mockEnv.EXPO_PUBLIC_SENTRY_DSN;
  return mod as SentryModule;
};

const fetchError = (
  code: number | string,
  message = 'boom',
  Ctor: typeof FetchError = FetchError,
): FetchError =>
  new Ctor(
    typeof code === 'number'
      ? {
          message,
          extensions: {
            originalError: {error: 'x', message, statusCode: code},
          },
        }
      : {message, extensions: {code}},
  );

const query = {kind: 'query' as const, key: ['product', 'detail', 1]};

describe('queryErrorReportKey — 정상 흐름인 실패는 보내지 않는다', () => {
  it.each<[string, unknown]>([
    ['네트워크 끊김', new TypeError('Network request failed')],
    ['취소', new CancelledError()],
    ['토큰 만료 401', fetchError(401)],
    ['거절 403', fetchError(403)],
    ['지워진 글 404', fetchError(404)],
    ['UNAUTHENTICATED', fetchError('UNAUTHENTICATED')],
  ])('%s → null', (_label, error) => {
    expect(queryErrorReportKey(error, query)).toBeNull();
  });

  it.each<[string, unknown, string]>([
    [
      '서버 500',
      fetchError(500, 'db down'),
      'graphql:500|query:product|db down',
    ],
    [
      '스키마 드리프트',
      fetchError('GRAPHQL_VALIDATION_FAILED', 'Cannot query field "x"'),
      'graphql:GRAPHQL_VALIDATION_FAILED|query:product|Cannot query field "x"',
    ],
    [
      '프록시 502 HTML',
      new Error('HTTP 502 — GraphQL 응답이 JSON 이 아님'),
      'Error|query:product|HTTP 502 — GraphQL 응답이 JSON 이 아님',
    ],
    [
      'queryFn 가공 중 예외',
      new TypeError("Cannot read property 'id' of null"),
      "TypeError|query:product|Cannot read property 'id' of null",
    ],
  ])('%s → 보낸다', (_label, error, expected) => {
    expect(queryErrorReportKey(error, query)).toBe(expected);
  });

  it('키가 없는 뮤테이션도 묶을 이름이 있다', () => {
    expect(
      queryErrorReportKey(fetchError(500), {kind: 'mutation', key: undefined}),
    ).toBe('graphql:500|mutation:unknown|boom');
  });
});

describe('Sentry 보고 (DSN 있음·릴리스)', () => {
  const prevDev = global.__DEV__;
  afterEach(() => {
    global.__DEV__ = prevDev;
  });
  beforeEach(() => {
    global.__DEV__ = false;
    jest.clearAllMocks();
    mockUpdates.isEmergencyLaunch = false;
    mockUpdates.emergencyLaunchReason = null;
  });

  it('같은 쿼리·같은 원인은 실행당 한 번만 보낸다 — 서버 장애 때 쿼터를 다 먹지 않게', () => {
    const {captureQueryError} = loadEnabledSentry();
    const err = () => fetchError(500, 'boom', IsolatedFetchError);
    captureQueryError(err(), query);
    captureQueryError(err(), query);
    captureQueryError(err(), {kind: 'query', key: ['home']});
    expect(Sentry.captureException).toHaveBeenCalledTimes(2);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(IsolatedFetchError),
      {
        tags: {query: 'product'},
        fingerprint: ['graphql:500|query:product|boom'],
      },
    );
  });

  it('걸러진 실패는 보내지 않는다', () => {
    const {captureQueryError} = loadEnabledSentry();
    captureQueryError(new TypeError('Network request failed'), query);
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('화면 이름을 태그와 이동 흔적으로 단다', () => {
    const {setSentryScreen} = loadEnabledSentry();
    setSentryScreen('ProductDetail');
    expect(Sentry.setTag).toHaveBeenCalledWith('screen', 'ProductDetail');
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'navigation',
        message: 'ProductDetail',
      }),
    );
  });

  it('init 은 내장 번들 실행 여부를 태그로 단다', () => {
    loadEnabledSentry().initSentry();
    expect(Sentry.setTag).toHaveBeenCalledWith('embedded_launch', 'false');
  });

  // 성능 추적(10/15 켬) — 화면 전환 트랜잭션은 NavigationContainer 를 이어야 생긴다.
  it('init 은 성능 추적을 5% 로 켜고, 화면 전환을 내비게이션 컨테이너에 잇는다', () => {
    const mod = loadEnabledSentry();
    mod.initSentry();
    const options = (Sentry.init as jest.Mock).mock.calls[0][0];
    expect(options.tracesSampleRate).toBe(0.05);
    expect(options.enableAutoPerformanceTracing).toBe(true);

    const integration = (Sentry.reactNavigationIntegration as jest.Mock).mock
      .results[0].value as {registerNavigationContainer: jest.Mock};
    expect(options.integrations).toContain(integration);
    const ref = {current: null};
    mod.registerSentryNavigation(ref);
    expect(integration.registerNavigationContainer).toHaveBeenCalledWith(ref);
  });

  it('OTA 비상 실행이면 GA4·Sentry 에 이유와 함께 남긴다', () => {
    mockUpdates.isEmergencyLaunch = true;
    mockUpdates.emergencyLaunchReason = 'launch failed: SIGABRT';
    loadEnabledSentry().reportEmergencyLaunch();
    expect(mockTrack).toHaveBeenCalledWith('ota_emergency_launch', {
      reason: 'launch failed: SIGABRT',
      platform: 'app',
    });
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'expo-updates emergency launch',
      expect.objectContaining({extra: {reason: 'launch failed: SIGABRT'}}),
    );
  });

  it('정상 실행이면 아무것도 보내지 않는다', () => {
    loadEnabledSentry().reportEmergencyLaunch();
    expect(mockTrack).not.toHaveBeenCalled();
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
  });
});

describe('DSN 없음 — Sentry 는 조용하고 GA4 만 남는다', () => {
  beforeEach(() => jest.clearAllMocks());

  it('비상 실행은 GA4 로만', () => {
    mockUpdates.isEmergencyLaunch = true;
    let mod: SentryModule | undefined;
    jest.isolateModules(() => {
      mod = require('../src/shared/lib/monitoring/sentry');
      Sentry = require('@sentry/react-native');
    });
    (mod as SentryModule).reportEmergencyLaunch();
    (mod as SentryModule).captureQueryError(fetchError(500), query);
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('init 이 안 돌았으면 내비게이션 연결도 하지 않는다', () => {
    let mod: SentryModule | undefined;
    jest.isolateModules(() => {
      mod = require('../src/shared/lib/monitoring/sentry');
      Sentry = require('@sentry/react-native');
    });
    (mod as SentryModule).initSentry();
    expect(() =>
      (mod as SentryModule).registerSentryNavigation({current: null}),
    ).not.toThrow();
    expect(Sentry.init).not.toHaveBeenCalled();
    expect(Sentry.reactNavigationIntegration).not.toHaveBeenCalled();
  });
});
