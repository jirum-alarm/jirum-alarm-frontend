declare const __dirname: string;
/**
 * 콜드 스타트 — 저장된 access 가 아직 살아 있으면 첫 토큰 갱신을 기다리지 않고 바로 보낸다.
 *
 * 예전엔 refresh token 이 있으면 **모든** access 요청(홈·상세)이 갱신 왕복이 끝날 때까지 줄 섰다.
 * 서버는 서명·만료만 보므로(1시간 토큰) 한 시간 안에 다시 켠 사람은 기다릴 이유가 없었다.
 */
import {
  accessTokenRemainingMs,
  isAccessTokenUsable,
} from '../src/shared/lib/client/token-expiry';
import type {TypedDocumentString} from '../src/shared/api/gql/graphql';

// exp = 2000000000(초) 인 토큰. payload 에 공백이 있는 JSON 이라 패딩 없는 base64url 디코드도 함께 본다.
const TOKEN_EXP_2E9 =
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJfaWQiOiA3LCAiX3JvbGUiOiAiVVNFUiIsICJpYXQiOiAxOTk5OTk2NDAwLCAiZXhwIjogMjAwMDAwMDAwMH0.sig';
const EXP_MS = 2_000_000_000 * 1000;

describe('token-expiry', () => {
  it('JWT exp 까지 남은 시간을 읽는다', () => {
    expect(accessTokenRemainingMs(TOKEN_EXP_2E9, EXP_MS - 5 * 60_000)).toBe(
      5 * 60_000,
    );
  });

  it.each([
    ['10분 남음 → 바로 쓴다', EXP_MS - 10 * 60_000, true],
    ['30초 남음 → 기다린다(시계 오차 여유 1분)', EXP_MS - 30_000, false],
    ['이미 지남 → 기다린다', EXP_MS + 1, false],
  ])('%s', (_label, now, usable) => {
    expect(isAccessTokenUsable(TOKEN_EXP_2E9, now)).toBe(usable);
  });

  it.each([null, '', 'not-a-jwt', 'a.b.c', 'a.eyJmb28iOjF9.c'])(
    '못 읽는 토큰(%p) → 기다린다',
    token => {
      expect(isAccessTokenUsable(token as string | null)).toBe(false);
    },
  );
});

describe('HttpClient.withAccessToken — 갱신 대기 건너뛰기', () => {
  const storage: Record<string, string | null> = {};
  let releaseAuth: () => void = () => {};
  const fetchMock = jest.fn();

  const load = () => {
    let mod: typeof import('../src/shared/lib/client/http-client') | undefined;
    jest.isolateModules(() => {
      jest.doMock('../src/shared/lib/persistence', () => ({
        getAsyncStorage: async (key: string) => storage[key] ?? null,
      }));
      jest.doMock('../src/shared/lib/device/device-id', () => ({
        getDeviceId: async () => 'dev-1',
      }));
      jest.doMock('../src/shared/lib/client/initial-auth', () => ({
        waitForInitialAuth: () =>
          new Promise<void>(resolve => {
            releaseAuth = resolve;
          }),
      }));
      mod = require('../src/shared/lib/client/http-client');
    });
    return mod as NonNullable<typeof mod>;
  };

  const flush = async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  };
  const authHeaders = () =>
    fetchMock.mock.calls.map(
      ([, init]) =>
        (init as {headers: Record<string, string>}).headers.Authorization,
    );
  const ok = () => ({json: async () => ({data: {ok: true}})});
  const unauthorized = () => ({
    json: async () => ({
      errors: [
        {
          message: 'Unauthorized',
          extensions: {
            originalError: {
              error: 'x',
              message: 'Unauthorized',
              statusCode: 401,
            },
          },
        },
      ],
    }),
  });

  let realNow: () => number;
  beforeEach(() => {
    fetchMock.mockReset();
    (globalThis as unknown as {fetch: unknown}).fetch = fetchMock;
    realNow = Date.now;
    Date.now = () => EXP_MS - 30 * 60_000; // 토큰이 30분 남은 시각
    for (const k of Object.keys(storage)) delete storage[k];
  });
  afterEach(() => {
    Date.now = realNow;
  });

  const QUERY = 'query { ok }' as unknown as TypedDocumentString<
    {ok: boolean},
    Record<string, never>
  >;

  it('살아 있는 access 면 갱신을 기다리지 않고 바로 보낸다', async () => {
    storage.accessToken = TOKEN_EXP_2E9;
    fetchMock.mockResolvedValue(ok());
    const {HttpClient} = load();
    const pending = HttpClient.withAccessToken().execute(QUERY);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(authHeaders()).toEqual([`Bearer ${TOKEN_EXP_2E9}`]);
    await expect(pending).resolves.toEqual({data: {ok: true}});
  });

  it('끝난 access 면 예전처럼 갱신을 기다렸다가 새 토큰으로 보낸다', async () => {
    Date.now = () => EXP_MS + 1;
    storage.accessToken = TOKEN_EXP_2E9;
    fetchMock.mockResolvedValue(ok());
    const {HttpClient} = load();
    const pending = HttpClient.withAccessToken().execute(QUERY);
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();

    storage.accessToken = 'fresh';
    releaseAuth();
    await pending;
    expect(authHeaders()).toEqual(['Bearer fresh']);
  });

  it('바로 보냈는데 401(기기 시계 오차)이면 갱신을 기다렸다가 한 번 다시', async () => {
    storage.accessToken = TOKEN_EXP_2E9;
    fetchMock.mockResolvedValueOnce(unauthorized()).mockResolvedValue(ok());
    const {HttpClient} = load();
    const pending = HttpClient.withAccessToken().execute(QUERY);
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    storage.accessToken = 'fresh';
    releaseAuth();
    await expect(pending).resolves.toEqual({data: {ok: true}});
    expect(authHeaders()).toEqual([`Bearer ${TOKEN_EXP_2E9}`, 'Bearer fresh']);
  });
});

describe('HttpClient.withFreshAccessTokenOrNone — 공개 조회는 갱신을 기다리지 않는다', () => {
  const storage: Record<string, string | null> = {};
  const fetchMock = jest.fn();
  let waited = 0;

  const load = () => {
    let mod: typeof import('../src/shared/lib/client/http-client') | undefined;
    jest.isolateModules(() => {
      jest.doMock('../src/shared/lib/persistence', () => ({
        getAsyncStorage: async (key: string) => storage[key] ?? null,
      }));
      jest.doMock('../src/shared/lib/device/device-id', () => ({
        getDeviceId: async () => 'dev-1',
      }));
      jest.doMock('../src/shared/lib/client/initial-auth', () => ({
        // 이걸 부르면 영영 안 끝난다 — 공개 조회가 기다리면 테스트가 멈춘다.
        waitForInitialAuth: () => {
          waited += 1;
          return new Promise<void>(() => {});
        },
      }));
      mod = require('../src/shared/lib/client/http-client');
    });
    return mod as NonNullable<typeof mod>;
  };
  const QUERY = 'query { ok }' as unknown as TypedDocumentString<
    {ok: boolean},
    Record<string, never>
  >;
  const auth = () =>
    (fetchMock.mock.calls[0][1] as {headers: Record<string, string>}).headers
      .Authorization;

  let realNow: () => number;
  beforeEach(() => {
    waited = 0;
    fetchMock.mockReset().mockResolvedValue({
      json: async () => ({data: {ok: true}}),
    });
    (globalThis as unknown as {fetch: unknown}).fetch = fetchMock;
    realNow = Date.now;
    for (const k of Object.keys(storage)) delete storage[k];
  });
  afterEach(() => {
    Date.now = realNow;
  });

  it('★토큰이 끝났으면(하루 한 번 켠 사람) 기다리지 않고 토큰 없이 바로 보낸다', async () => {
    Date.now = () => EXP_MS + 60_000;
    storage.accessToken = TOKEN_EXP_2E9;
    const {HttpClient} = load();
    await expect(
      HttpClient.withFreshAccessTokenOrNone().execute(QUERY),
    ).resolves.toEqual({data: {ok: true}});
    expect(waited).toBe(0);
    expect(auth()).toBe('');
  });

  it('살아 있으면 붙여 보낸다(노출 기록에 회원이 남게)', async () => {
    Date.now = () => EXP_MS - 30 * 60_000;
    storage.accessToken = TOKEN_EXP_2E9;
    const {HttpClient} = load();
    await HttpClient.withFreshAccessTokenOrNone().execute(QUERY);
    expect(waited).toBe(0);
    expect(auth()).toBe(`Bearer ${TOKEN_EXP_2E9}`);
  });

  it('토큰이 아예 없어도 바로', async () => {
    const {HttpClient} = load();
    await HttpClient.withFreshAccessTokenOrNone().execute(QUERY);
    expect(waited).toBe(0);
    expect(auth()).toBe('');
  });
});

describe('홈 서비스 — 어떤 조회가 기다리지 않나', () => {
  const fs = require('fs');
  const path = require('path');
  const src: string = fs.readFileSync(
    path.join(__dirname, '../src/shared/api/home/home.service.ts'),
    'utf8',
  );
  const clientOf = (query: string) =>
    src.match(
      new RegExp(`HttpClient\\.(\\w+)\\(\\)\\.execute\\(\\s*${query}\\b`),
    )?.[1];

  it.each([
    'QueryHomePage',
    'QueryHotDealRankingProducts',
    'QueryGuestRecommendedHotDeals',
    'QueryHomeProducts',
    'QueryProductsByKeyword',
    'QueryExpiringSoonHotDealProducts',
    'QueryTossProducts',
  ])('공개 목록 %s 는 기다리지 않는다', q => {
    expect(clientOf(q)).toBe('withFreshAccessTokenOrNone');
  });

  it('추천 키워드는 내가 등록한 걸 빼야 해서 갱신을 기다린다', () => {
    expect(clientOf('QueryRecommendedNotificationKeywords')).toBe(
      'withAccessToken',
    );
  });
});
