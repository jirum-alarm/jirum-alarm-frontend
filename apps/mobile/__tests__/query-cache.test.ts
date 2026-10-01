/**
 * 디스크 화면 캐시 — 목록 루트만, 무한 스크롤은 첫 페이지만, auth(토큰)는 절대 안 남긴다.
 * 복원하면 마지막 목록이 바로 보이고, 깨진 캐시는 버린다.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {QueryClient} from '@tanstack/react-query';
import {
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
