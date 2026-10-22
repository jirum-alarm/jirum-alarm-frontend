/**
 * 발견 탭 랭킹 — 50장을 한 번에 그리지 않고, 순위·노출 position 은 그대로인가.
 *
 * 예전 ScrollView 는 카드 50장을 한꺼번에 그렸고, 칩을 누를 때마다(key 로 갈아끼움) 50장을
 * 처음부터 다시 만들었다. FlatList 로 바꾸면서 순위 뱃지·CTR position 이 어긋나면 안 된다.
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';
import {FlatList} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const mockRecordImpressions = jest.fn(async () => {});
jest.mock('../src/shared/api/product/product.service', () => ({
  ProductService: {
    recordProductImpressions: (...a: unknown[]) =>
      (mockRecordImpressions as jest.Mock)(...a),
    collectProduct: jest.fn(async () => {}),
  },
}));

// 카드·캐러셀 내용은 이 테스트의 관심이 아니다 — 몇 장 그려졌는지·순위만 본다.
const mockGridCards: {id: string; rank?: number}[] = [];
jest.mock('../src/entities/home/ui/cards/HomeProductCards', () => ({
  GridCard: ({product, rank}: {product: {id: string}; rank?: number}) => {
    mockGridCards.push({id: product.id, rank});
    return null;
  },
}));
jest.mock('../src/entities/home/ui/DynamicProductList', () => ({
  CarouselList: () => null,
}));
// 폰 폭으로 고정 — RN jest 창은 750 이라 넓은 화면(4열)으로 잡힌다. 넓은 화면은 buildRankingRows 테스트가 본다.
jest.mock('../src/shared/components/SideSafeArea', () => ({
  useContentWidth: () => 390,
}));

import RankingList, {
  buildRankingRows,
  type RankingRow,
} from '../src/entities/trending/ui/RankingList';
import {TrendingQueries} from '../src/entities/trending/api/trending.queries';
import type {ProductCardType} from '../src/entities/home/model/types';

declare const __dirname: string;

const product = (n: number): ProductCardType => ({
  id: String(1000 + n),
  title: `p${n}`,
  postedAt: '2026-10-12T00:00:00Z',
});
const fifty: ProductCardType[] = Array.from({length: 50}, (_, i) => product(i));

/**
 * 그린 트리·클라이언트는 테스트마다 거둔다. 안 거두면 react-query 알림 타이머가 테스트가 끝난 뒤
 * act 밖에서 상태를 바꿔 「Cannot log after tests are done」이 나고, CI(--runInBand)에서 jest 가
 * 전부 통과하고도 exit 1 로 끝난다(10/12 mobile-validation 실패).
 */
const cleanups: Array<() => void> = [];
const track = (
  renderer: ReactTestRenderer.ReactTestRenderer,
  client?: QueryClient,
) => {
  cleanups.push(() => {
    ReactTestRenderer.act(() => renderer.unmount());
    client?.clear();
  });
  return renderer;
};
afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
});

describe('buildRankingRows — 줄 목록', () => {
  const rows = buildRankingRows({
    products: fifty,
    categoryName: '전체',
    live: [product(900)],
    recommended: [product(901)],
  });
  const grids = rows.filter(
    (r): r is Extract<RankingRow, {type: 'grid'}> => r.type === 'grid',
  );

  it('1~10위 5줄 → 실시간 캐러셀 → 11~50위 20줄 → 추천 캐러셀', () => {
    expect(rows.map(r => r.type)).toEqual([
      ...Array(5).fill('grid'),
      'carousel',
      ...Array(20).fill('grid'),
      'carousel',
    ]);
  });

  it('★캐러셀 뒤 첫 줄도 position 이 10부터 이어진다(뱃지 11위)', () => {
    expect(grids[5].positionFrom).toBe(10);
    expect(grids[5].products.map(p => p.id)).toEqual(['1010', '1011']);
  });

  it('간격: 그리드끼리 20, 섹션 경계 32, 맨 끝 0', () => {
    expect(rows[0].gapAfter).toBe(20);
    expect(rows[4].gapAfter).toBe(32); // 10위 줄 → 캐러셀
    expect(rows.at(-1)?.gapAfter).toBe(0);
  });

  it('캐러셀이 비면 빼고, 홀수 개면 마지막 줄은 1장', () => {
    const odd = buildRankingRows({
      products: fifty.slice(0, 13),
      categoryName: '전체',
      live: [],
    });
    expect(odd.every(r => r.type === 'grid')).toBe(true);
    expect(odd.at(-1)?.type === 'grid' && odd.at(-1)?.products).toHaveLength(1);
  });
});

describe('buildRankingRows — 넓은 화면(열이 늘어남)', () => {
  const rows = buildRankingRows({
    products: fifty,
    categoryName: '전체',
    live: [product(900)],
    columns: 4,
  });
  const grids = rows.filter(
    (r): r is Extract<RankingRow, {type: 'grid'}> => r.type === 'grid',
  );

  it('4장씩 끊고, 10위에서 끊긴 줄은 덜 찬 채 캐러셀로 넘어간다', () => {
    expect(grids.slice(0, 3).map(g => g.products.length)).toEqual([4, 4, 2]);
    expect(rows[3].type).toBe('carousel');
    expect(grids[3].positionFrom).toBe(10);
    expect(grids.every(g => g.columns === 4)).toBe(true);
  });
});

describe('RankingList — 첫 화면만 그리고, 보인 줄만 노출로 센다', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockGridCards.length = 0;
    mockRecordImpressions.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  const mount = () => {
    const client = new QueryClient({
      defaultOptions: {queries: {retry: false, staleTime: Infinity}},
    });
    client.setQueryData(TrendingQueries.ranking(1).queryKey, fifty);
    client.setQueryData(TrendingQueries.rankingLive(1).queryKey, []);
    client.setQueryData(TrendingQueries.recommended().queryKey, []);
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = track(
        ReactTestRenderer.create(
          <QueryClientProvider client={client}>
            <RankingList
              categoryId={1}
              categoryName="전체"
              onPressProduct={() => {}}
              bottomInset={0}
            />
          </QueryClientProvider>,
        ),
        client,
      );
    });
    return renderer;
  };

  it('50장 중 첫 4줄(8장)만 그린다 — 순위 뱃지는 1위부터', () => {
    mount();
    expect(mockGridCards.length).toBeLessThan(50);
    expect(mockGridCards.slice(0, 8).map(c => c.rank)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it('보인 줄의 카드만 (productId, position) 으로 기록한다', () => {
    const renderer = mount();
    const list = renderer.root.findByType(FlatList);
    const rows = list.props.data as RankingRow[];
    ReactTestRenderer.act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [{item: rows[5], index: 5, isViewable: true}],
        changed: [],
      });
      jest.advanceTimersByTime(1500);
    });
    expect(mockRecordImpressions).toHaveBeenCalledWith({
      source: 'ranking_tab',
      impressions: [
        {productId: 1010, position: 10},
        {productId: 1011, position: 11},
      ],
    });
  });
});

describe('CurationGrid 공용 그리드(6화면) — 가상화·고정된 카드 그리기', () => {
  const CurationGrid = require('../src/entities/home/ui/CurationGrid').default;

  it('FlashList — 50장 중 화면에 드는 칸만 그리고, 위에 새 딜이 끼어도 보던 자리를 붙잡지 않는다', () => {
    const {FlashList} = require('@shopify/flash-list');
    const renderCard = jest.fn(() => null);
    let renderer!: ReactTestRenderer.ReactTestRenderer;
    ReactTestRenderer.act(() => {
      renderer = track(
        ReactTestRenderer.create(
          <CurationGrid
            items={fifty}
            keyOf={(p: ProductCardType) => p.id}
            renderCard={renderCard}
            isPending={false}
            isError={false}
            label="t"
            onRetry={() => {}}
          />,
        ),
      );
    });
    const list = renderer.root.findByType(FlashList);
    expect(list.props.numColumns).toBe(2);
    // 당겨서 새로고침으로 새 딜이 맨 위에 들어오면 그게 보여야 한다(v2 기본값은 옛 첫 카드를 붙잡는다).
    expect(list.props.maintainVisibleContentPosition).toEqual({disabled: true});
    // FlashList 기본 250ms 면 빠르게 넘긴 카드가 노출(CTR 분모)에서 빠진다 — FlatList 처럼 0.
    expect(list.props.viewabilityConfig).toEqual({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 0,
    });
    expect(renderCard.mock.calls.length).toBeGreaterThan(0);
    expect(renderCard.mock.calls.length).toBeLessThan(50);
  });

  it('★재사용되는 칸 안의 state 는 상품 id 로 key 를 건다 — 안 걸면 다른 상품에 찜 해제 하트가 남는다', () => {
    const fs = require('fs');
    const path = require('path');
    const src: string = fs.readFileSync(
      path.join(__dirname, '..', 'src/screens/mypage/LikeScreen.tsx'),
      'utf8',
    );
    expect(src).toMatch(/<WishlistHeart\s+key=\{item\.id\}/);
  });

  it('★호출부가 renderCard 를 인라인으로 넘기지 않는다 — 넘기면 페이지가 붙을 때마다 보이는 카드가 전부 다시 그려진다', () => {
    const fs = require('fs');
    const path = require('path');
    const callers = [
      'src/screens/curation/CurationScreen.tsx',
      'src/screens/curation/TossCurationScreen.tsx',
      'src/screens/detail/RelatedProductsScreen.tsx',
      'src/screens/mypage/LikeScreen.tsx',
      'src/screens/search/ui/SearchResults.tsx',
      'src/entities/trending/ui/LiveList.tsx',
    ];
    for (const file of callers) {
      const src: string = fs.readFileSync(
        path.join(__dirname, '..', file),
        'utf8',
      );
      expect({file, inline: /renderCard=\{\s*\(?item/.test(src)}).toEqual({
        file,
        inline: false,
      });
    }
  });
});
