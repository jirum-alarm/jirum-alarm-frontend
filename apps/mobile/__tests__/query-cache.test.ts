/**
 * 디스크 화면 캐시 — 목록 루트만, 무한 스크롤은 첫 페이지만, auth(토큰)는 절대 안 남긴다.
 * 복원하면 마지막 목록이 바로 보이고, 깨진 캐시는 버린다.
 * 저장소는 MMKV(동기) — 복원이 첫 렌더 전에 끝나야 한다(예전 AsyncStorage 는 최대 800ms 화면을 막았다).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient} from '@tanstack/react-query';
import {createMMKV, type MMKV} from 'react-native-mmkv';
import {
  QUERY_DOCS_FINGERPRINT,
  clearQueryCache,
  dropLegacyAsyncCache,
  resetQueryCacheStoreForTest,
  restoreQueryCache,
  saveQueryCache,
  toSnapshotState,
} from '../src/shared/lib/persistence/query-cache';

// gcTime Infinity — 가비지 수집 타이머가 jest 를 붙잡지 않게.
const makeClient = (): QueryClient =>
  new QueryClient({defaultOptions: {queries: {gcTime: Infinity}}});

// query-cache 가 여는 것과 같은 id — 목(__mocks__/react-native-mmkv)은 같은 id 끼리 저장소를 공유한다.
const raw = (): MMKV => createMMKV({id: 'query-cache'});

beforeEach(async () => {
  (
    require('react-native-mmkv') as {__resetAllMMKV: () => void}
  ).__resetAllMMKV();
  resetQueryCacheStoreForTest();
  await AsyncStorage.clear();
});

it('목록 루트만 남기고 auth·상품 상세는 뺀다', () => {
  const client = makeClient();
  client.setQueryData(['home', 'curation'], {items: [1]});
  client.setQueryData(['auth', 'loginByRefreshToken'], {token: 'secret'});
  client.setQueryData(['product', 1], {id: 1});

  const keys = toSnapshotState(client).queries.map(q => q.queryKey[0]);
  expect(keys).toEqual(['home']);
});

it('무한 스크롤은 첫 페이지만 남긴다', () => {
  const client = makeClient();
  client.setQueryData(['trending', 'live'], {
    pages: [['a'], ['b'], ['c']],
    pageParams: [undefined, 'c1', 'c2'],
  });

  const [q] = toSnapshotState(client).queries;
  expect(q.state.data).toEqual({pages: [['a']], pageParams: [undefined]});
});

it('저장한 것을 새 클라이언트에 **동기로** 복원하고, 깨진 캐시는 지운다', () => {
  const a = makeClient();
  a.setQueryData(['notification', 'list'], {items: ['n1']});
  saveQueryCache(a);

  const b = makeClient();
  // await 없이 — 반환 직후 데이터가 있어야 첫 렌더가 복원본을 그린다.
  const restored: boolean = restoreQueryCache(b);
  expect(restored).toBe(true);
  expect(b.getQueryData(['notification', 'list'])).toEqual({items: ['n1']});

  raw().set('rq-cache', '{broken');
  expect(restoreQueryCache(makeClient())).toBe(false);
  expect(raw().getString('rq-cache')).toBeUndefined();
});

it('하루 지난 캐시는 복원하지 않고 지운다', () => {
  const a = makeClient();
  a.setQueryData(['home', 'curation'], {items: [1]});
  saveQueryCache(a);
  const saved = JSON.parse(raw().getString('rq-cache') ?? '{}');
  raw().set(
    'rq-cache',
    JSON.stringify({...saved, savedAt: Date.now() - 25 * 60 * 60 * 1000}),
  );

  const b = makeClient();
  expect(restoreQueryCache(b)).toBe(false);
  expect(b.getQueryData(['home', 'curation'])).toBeUndefined();
  expect(raw().getString('rq-cache')).toBeUndefined();
});

it('1MB 를 넘으면 저장하지 않고 이전 캐시도 지운다 — 동기 복원이 첫 화면을 늦추지 않게', () => {
  const small = makeClient();
  small.setQueryData(['home', 'curation'], {items: [1]});
  saveQueryCache(small);
  expect(raw().getString('rq-cache')).toBeDefined();

  const big = makeClient();
  big.setQueryData(['home', 'curation'], {blob: 'x'.repeat(1_100_000)});
  saveQueryCache(big);
  expect(raw().getString('rq-cache')).toBeUndefined();
});

it('로그아웃 clearQueryCache 는 디스크 캐시를 지운다', async () => {
  const a = makeClient();
  a.setQueryData(['mypage', 'me'], {id: 1});
  saveQueryCache(a);
  await clearQueryCache();
  expect(restoreQueryCache(makeClient())).toBe(false);
});

it('옛 AsyncStorage 캐시 키 하나만 지우고 다른 키(토큰·기기 id 등)는 그대로 둔다 — 한 번만', async () => {
  await AsyncStorage.multiSet([
    ['rq-cache', '{"old":1}'],
    ['refreshToken', '"r"'],
    ['deviceId', '"d"'],
  ]);
  await dropLegacyAsyncCache();
  expect(await AsyncStorage.getItem('rq-cache')).toBeNull();
  expect(await AsyncStorage.getItem('refreshToken')).toBe('"r"');
  expect(await AsyncStorage.getItem('deviceId')).toBe('"d"');

  // 두 번째 실행부터는 AsyncStorage 를 건드리지 않는다(공식 목의 removeItem 은 jest.fn — 호출 수 차이로 본다).
  const remove = AsyncStorage.removeItem as jest.Mock;
  const before: number = remove.mock.calls.length;
  await dropLegacyAsyncCache();
  expect(remove.mock.calls.length).toBe(before);
});

it('MMKV 를 못 열면(네이티브 모듈 없음) 캐시 없이 조용히 동작한다', async () => {
  const mmkvModule = require('react-native-mmkv') as {
    createMMKV: () => MMKV;
  };
  const create = jest.spyOn(mmkvModule, 'createMMKV').mockImplementation(() => {
    throw new Error('NitroModules not found');
  });
  const log = jest.spyOn(console, 'log').mockImplementation(() => {});
  try {
    const client = makeClient();
    client.setQueryData(['home', 'curation'], {items: [1]});

    expect(() => saveQueryCache(client)).not.toThrow();
    expect(restoreQueryCache(makeClient())).toBe(false);
    await expect(clearQueryCache()).resolves.toBeUndefined();
    // 옛 AsyncStorage 캐시 정리는 MMKV 없이도 된다.
    await AsyncStorage.setItem('rq-cache', 'old');
    await dropLegacyAsyncCache();
    expect(await AsyncStorage.getItem('rq-cache')).toBeNull();
    expect(create).toHaveBeenCalledTimes(1); // 한 번 실패하면 다시 열려 하지 않는다
  } finally {
    create.mockRestore();
    log.mockRestore();
  }
});

/**
 * 캐시는 OTA 마다 버리지 않는다(자동 OTA 가 잦아 거의 매번 스켈레톤이 됐다).
 * 대신 **쿼리 문서가 바뀌면** 버린다 — 이 지문이 그 판정이다. 문서를 고치고 이 테스트가 실패하면
 * 아래 기대값을 query-cache.ts 의 QUERY_DOCS_FINGERPRINT 에 그대로 넣는다(그 값이 곧 캐시 버림).
 */
it('GraphQL 문서 지문이 지금 문서와 맞는다 — 쿼리가 바뀌면 옛 모양 캐시를 버리게', () => {
  const crypto = require('crypto');
  const fsLocal = require('fs');
  const pathLocal = require('path');
  const src = pathLocal.join(__dirname, '../src');
  // 코드젠 문서 전부 + 손으로 쓴 문서(new TypedDocumentString — 홈 SDUI 쿼리)
  const handWritten: string[] = fsLocal
    .readdirSync(src, {recursive: true})
    .map((f: string) => pathLocal.join(src, f))
    .filter(
      (f: string) =>
        /\.tsx?$/.test(f) &&
        !f.includes(`${pathLocal.sep}gql${pathLocal.sep}`) &&
        fsLocal.readFileSync(f, 'utf8').includes('new TypedDocumentString'),
    )
    .sort();
  const hash = crypto.createHash('sha1');
  hash.update(
    fsLocal.readFileSync(pathLocal.join(src, 'shared/api/gql/gql.ts'), 'utf8'),
  );
  // 손으로 쓴 파일은 **문서 문자열만** 본다 — 파일 통째면 같은 파일의 서비스 코드·주석만 고쳐도 지문이 바뀌어
  // 모든 사용자의 화면 캐시를 버렸다(10/13 home.service 의 토큰 모드만 바꿨는데 지문이 바뀜).
  for (const f of handWritten) {
    const text: string = fsLocal.readFileSync(f, 'utf8');
    for (const m of text.matchAll(
      /new TypedDocumentString[\s\S]*?\(\s*`([\s\S]*?)`/g,
    )) {
      hash.update(m[1]);
    }
  }
  const actual: string = hash.digest('hex').slice(0, 12);
  expect(QUERY_DOCS_FINGERPRINT).toBe(actual);
});

it('지문이 다른(옛 문서로 저장한) 캐시는 복원하지 않고 지운다', () => {
  const a = makeClient();
  a.setQueryData(['home', 'curation'], {items: [1]});
  saveQueryCache(a);
  const saved = JSON.parse(raw().getString('rq-cache') ?? '{}');
  expect(saved.buster).toBe(`1:${QUERY_DOCS_FINGERPRINT}`);
  raw().set('rq-cache', JSON.stringify({...saved, buster: '1:old-docs'}));

  const b = makeClient();
  expect(restoreQueryCache(b)).toBe(false);
  expect(b.getQueryData(['home', 'curation'])).toBeUndefined();
  expect(raw().getString('rq-cache')).toBeUndefined();
});
