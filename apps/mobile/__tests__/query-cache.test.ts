/**
 * 디스크 화면 캐시 — 목록 루트만, 무한 스크롤은 첫 페이지만, auth(토큰)는 절대 안 남긴다.
 * 복원하면 마지막 목록이 바로 보이고, 깨진 캐시는 버린다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient} from '@tanstack/react-query';
import {
  QUERY_DOCS_FINGERPRINT,
  restoreQueryCache,
  saveQueryCache,
  toSnapshotState,
} from '../src/shared/lib/persistence/query-cache';

// gcTime Infinity — 가비지 수집 타이머가 jest 를 붙잡지 않게.
const makeClient = () =>
  new QueryClient({defaultOptions: {queries: {gcTime: Infinity}}});

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

it('저장한 것을 새 클라이언트에 복원하고, 깨진 캐시는 지운다', async () => {
  const a = makeClient();
  a.setQueryData(['notification', 'list'], {items: ['n1']});
  await saveQueryCache(a);

  const b = makeClient();
  await restoreQueryCache(b);
  expect(b.getQueryData(['notification', 'list'])).toEqual({items: ['n1']});

  await AsyncStorage.setItem('rq-cache', '{broken');
  await restoreQueryCache(makeClient());
  expect(await AsyncStorage.getItem('rq-cache')).toBeNull();
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
  for (const f of [
    pathLocal.join(src, 'shared/api/gql/gql.ts'),
    ...handWritten,
  ]) {
    hash.update(fsLocal.readFileSync(f, 'utf8'));
  }
  const actual: string = hash.digest('hex').slice(0, 12);
  expect(QUERY_DOCS_FINGERPRINT).toBe(actual);
});

it('지문이 다른(옛 문서로 저장한) 캐시는 복원하지 않고 지운다', async () => {
  const a = makeClient();
  a.setQueryData(['home', 'curation'], {items: [1]});
  await saveQueryCache(a);
  const saved = JSON.parse((await AsyncStorage.getItem('rq-cache')) ?? '{}');
  await AsyncStorage.setItem(
    'rq-cache',
    JSON.stringify({...saved, buster: '1:old-docs'}),
  );

  const b = makeClient();
  await restoreQueryCache(b);
  expect(b.getQueryData(['home', 'curation'])).toBeUndefined();
  expect(await AsyncStorage.getItem('rq-cache')).toBeNull();
});
