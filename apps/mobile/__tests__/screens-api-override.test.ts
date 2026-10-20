import AsyncStorage from '@react-native-async-storage/async-storage';

import {GRAPHQL_ENDPOINT} from '../src/shared/constant/endpoint';
import {
  SCREENS_API_KEY,
  graphqlEndpoint,
  parseScreensApiUrl,
  resetScreensApiForTest,
} from '../src/shared/lib/client/screens-api';

// 화면 하네스가 앱을 고정 데이터 서버에 붙이는 입구 — 같은 맥(localhost)만 받고, 그 밖은 무시해 운영으로 간다.
describe('parseScreensApiUrl', () => {
  it.each([
    ['http://localhost:9190/graphql', 'http://localhost:9190/graphql'],
    ['http://127.0.0.1:9190/graphql', 'http://127.0.0.1:9190/graphql'],
    ['  http://localhost:9190/graphql ', 'http://localhost:9190/graphql'],
  ])('같은 맥 주소는 받는다: %s', (input: string, expected: string) => {
    expect(parseScreensApiUrl(input)).toBe(expected);
  });

  it.each([
    [null],
    [''],
    ['https://evil.example.com/graphql'],
    ['http://localhost.evil.com/graphql'],
    ['http://user@localhost:9190/graphql'],
    ['http://10.0.2.2:9190/graphql'],
    ['localhost:9190/graphql'],
  ])('그 밖은 무시한다: %s', (input: string | null) => {
    expect(parseScreensApiUrl(input)).toBeNull();
  });
});

describe('graphqlEndpoint', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetScreensApiForTest();
  });

  it('키가 없으면 운영 주소', async () => {
    await expect(graphqlEndpoint()).resolves.toBe(GRAPHQL_ENDPOINT);
  });

  it('하네스 키가 있으면 그 주소', async () => {
    await AsyncStorage.setItem(
      SCREENS_API_KEY,
      'http://localhost:9190/graphql',
    );
    await expect(graphqlEndpoint()).resolves.toBe(
      'http://localhost:9190/graphql',
    );
  });

  it('남의 주소가 들어 있으면 운영 주소', async () => {
    await AsyncStorage.setItem(
      SCREENS_API_KEY,
      'https://evil.example.com/graphql',
    );
    await expect(graphqlEndpoint()).resolves.toBe(GRAPHQL_ENDPOINT);
  });

  it('저장소는 한 번만 읽는다', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem');
    spy.mockClear(); // 저장소 목은 앞 테스트의 호출을 쌓아 둔다
    await graphqlEndpoint();
    await graphqlEndpoint();
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});
