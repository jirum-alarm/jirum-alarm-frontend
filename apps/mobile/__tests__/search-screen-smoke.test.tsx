/**
 * 검색 화면 전체를 실제로 마운트한다 — "grep 히트 ≠ 렌더됨" 때문에
 * 접합부(훅 순서·프로바이더·초기/결과 상태 전환)는 렌더로만 확인된다.
 *
 * 네트워크는 타지 않는다: 서비스 계층을 mock 한다(이 레포의 관행 —
 * mobile-jest-expo-native-module-traps). 네이티브 모듈(edge-to-edge·safe-area·
 * AsyncStorage)과 탭바 치수(expo-glass-effect ESM)도 같은 이유로 mock 한다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

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
jest.mock('react-native-edge-to-edge', () => ({SystemBars: () => null}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({top: 44, bottom: 34, left: 0, right: 0}),
}));
// expo-glass-effect(ESM) 를 끌어오는 tab-bar-metrics 를 피한다.
jest.mock('../src/shared/hooks/useHideTabBar', () => ({
  useHiddenTabBarClipPadding: () => 0,
}));

// ⚠️jest.mock 팩토리는 스코프 밖 변수를 못 본다 — 이름을 `mock` 으로 시작해야
// babel-plugin-jest-hoist 가 허용한다.
const mockGetProducts = jest.fn(
  async (_variables: Record<string, unknown>) => [] as unknown[],
);
const mockGetSuggestions = jest.fn(
  async (_variables: Record<string, unknown>) => [] as string[],
);
jest.mock('../src/shared/api/search', () => ({
  SearchService: {
    getProducts: mockGetProducts,
    getSuggestions: mockGetSuggestions,
  },
}));
jest.mock('../src/shared/api/category', () => ({
  CategoryService: {
    getCategories: async () => [{id: '1', name: '디지털'}],
    getMyFavoriteCategories: async () => null,
  },
}));
jest.mock('../src/shared/api/home/home.service', () => ({
  HomeService: {
    getCommunityProviders: async () => [
      {id: '1', name: 'ppomppu', nameKr: '뽐뿌'},
    ],
    getCommunityRandomRankingProducts: async () => [],
  },
}));

// ★import 는 위 mock 선언보다 위로 끌어올려진다 → 화면은 require 로 늦게 읽는다.
const SearchScreen = require('../src/screens/search/SearchScreen').default;

function textsOf(tree: ReactTestRenderer.ReactTestRenderer): string[] {
  const out: string[] = [];
  const walk = (node: unknown): void => {
    if (typeof node === 'string') {
      out.push(node);
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const n = node as {children?: unknown} | null;
    if (n && typeof n === 'object' && n.children) walk(n.children);
  };
  walk(tree.toJSON());
  return out;
}

async function mount(params?: {keyword?: string}) {
  const client = new QueryClient({
    defaultOptions: {queries: {retry: false, gcTime: 0}},
  });
  const navigation = {
    push: jest.fn(),
    goBack: jest.fn(),
    getParent: () => ({push: jest.fn()}),
  };
  let tree!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(
      <QueryClientProvider client={client}>
        <SearchScreen navigation={navigation as never} route={{params}} />
      </QueryClientProvider>,
    );
  });
  // 하이드레이션·쿼리가 끝난 뒤 정리한다(타이머가 남으면 jest 가 안 끝난다).
  const cleanup = async () => {
    await ReactTestRenderer.act(async () => {
      tree.unmount();
    });
    client.clear();
  };
  return {tree, navigation, cleanup};
}

describe('검색 화면 마운트', () => {
  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    mockGetProducts.mockClear();
    mockGetSuggestions.mockClear();
  });

  it('검색어 없이 들어오면 초기 화면(추천 검색어·추천 핫딜)이 그려진다', async () => {
    const {tree, cleanup} = await mount(undefined);
    const texts = textsOf(tree);
    expect(texts).toContain('추천 검색어');
    expect(texts).toContain('추천 핫딜');
    // 결과 목록은 아직 요청하지 않는다.
    expect(mockGetProducts).not.toHaveBeenCalled();
    await cleanup();
  });

  it('★딥링크 keyword 로 들어오면 곧바로 그 검색어로 결과를 요청한다', async () => {
    const {tree, cleanup} = await mount({keyword: '모니터'});
    expect(mockGetProducts).toHaveBeenCalled();
    expect(mockGetProducts.mock.calls[0][0]).toMatchObject({
      keyword: '모니터',
    });
    // 필터 바가 결과 화면에 같이 뜬다(web 과 같다 — 빈 결과에서도 필터를 풀 수 있어야).
    const texts = textsOf(tree);
    expect(texts).toContain('카테고리');
    expect(texts).toContain('기간');
    expect(texts).toContain('최신순');
    await cleanup();
  });

  it('딥링크 검색어가 최근 검색어로 저장된다', async () => {
    const {cleanup} = await mount({keyword: '모니터'});
    expect(store.recentSearchKeywords).toBe(JSON.stringify(['모니터']));
    await cleanup();
  });

  it('결과가 0건이면 빈 상태 문구가 뜬다', async () => {
    const {tree, cleanup} = await mount({keyword: '없는검색어'});
    expect(textsOf(tree)).toContain('검색 결과가 없어요');
    await cleanup();
  });
});
