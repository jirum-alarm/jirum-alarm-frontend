/**
 * 홈 카드·레이아웃을 **운영 실데이터**로 렌더해서 검증한다.
 *
 * 합성 데이터만 쓰면 놓치는 게 많다(chart-axis-real-data-findings: 합성이 놓친
 * 결함이 실데이터에서 20배). 픽스처는 운영 API 응답을 그대로 받아둔 것이라
 * 가격 비정형·mallName 누락·긴 제목 같은 실제 분포가 들어 있다.
 *
 * 픽스처 갱신: __tests__/fixtures/home-live.json (수동, 필요할 때만)
 */
import * as React from 'react';
import * as ReactTestRenderer from 'react-test-renderer';

jest.mock('../global.css', () => ({}));

import DynamicProductList from '../src/entities/home/ui/DynamicProductList';
import type {ProductCardType} from '../src/entities/home/model/types';

const live = require('./fixtures/home-live.json') as Record<
  string,
  ProductCardType[]
>;

/** 렌더 후 트리에서 모든 문자열을 모은다. */
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

function render(type: string, products: ProductCardType[]) {
  let tree!: ReactTestRenderer.ReactTestRenderer;
  ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(
      <DynamicProductList
        type={type as never}
        products={products}
        onPressProduct={() => {}}
      />,
    );
  });
  return tree;
}

describe('레이아웃 6종이 실데이터로 렌더된다', () => {
  const cases: [string, ProductCardType[]][] = [
    ['GRID', live.hotdeal],
    ['PAGINATED_GRID', live.hotdeal],
    ['GRID_TABBED', live.mall],
    ['HORIZONTAL_SCROLL', live.under10000],
    ['DOUBLE_ROW', live.impending],
    ['LIST', live.premium],
  ];

  it.each(cases)('%s 는 크래시 없이 그려진다', (type, products) => {
    expect(products.length).toBeGreaterThan(0);
    const tree = render(type, products);
    expect(tree.toJSON()).toBeTruthy();
  });

  it('빈 배열이어도 죽지 않는다', () => {
    for (const [type] of cases) {
      expect(() => render(type, [])).not.toThrow();
    }
  });

  it('알 수 없는 타입은 web 처럼 null', () => {
    expect(render('BANNER', live.hotdeal).toJSON()).toBeNull();
  });
});

describe('표기가 web 규칙과 같다', () => {
  it('가격에 원이 붙고 천단위 콤마가 들어간다', () => {
    const texts = textsOf(render('GRID', live.hotdeal));
    const prices = texts.filter(t => /^[\d,]+원$/.test(t));
    expect(prices.length).toBeGreaterThan(0);
    // 1,000원 이상이면 콤마가 있어야 한다
    for (const p of prices) {
      const n = Number(p.replace(/[^0-9]/g, ''));
      if (n >= 1000) expect(p).toContain(',');
    }
  });

  it('PAGINATED_GRID 는 4개씩 끊고 페이지 표시를 낸다', () => {
    const texts = textsOf(render('PAGINATED_GRID', live.hotdeal));
    expect(texts).toContain('추천 상품 더보기');
    // 20건 / 4 = 5페이지
    expect(texts.join('')).toContain('/5');
  });

  it('LIST 는 4개까지만(web slice(0,4))', () => {
    const many = [...live.hotdeal]; // 20건
    const texts = textsOf(render('LIST', many));
    const titles = many.map(p => p.title);
    const shown = titles.filter(t => texts.includes(t));
    expect(shown.length).toBeLessThanOrEqual(4);
  });

  it('유통기한 임박은 만료일 뱃지를 MM.DD 로 그린다', () => {
    const withExpiry = live.impending.filter(p => p.earliestExpiryDate);
    if (withExpiry.length === 0) return; // 데이터가 없으면 통과
    // JSX `유통기한 {formatMMD(...)}` 는 children 이 두 조각으로 나뉜다
    // ("유통기한 " + "08.18") — 이어붙여서 본다.
    const joined = textsOf(render('DOUBLE_ROW', live.impending)).join('\u0000');
    expect(joined).toMatch(/유통기한 \u0000?\d{2}\.\d{2}/);
  });

  it('판매종료면 뱃지를 낸다', () => {
    const ended: ProductCardType[] = [
      {...live.hotdeal[0], isEnd: true, hotDealType: 'HOT' as never},
    ];
    expect(textsOf(render('GRID', ended))).toContain('판매종료');
  });

  it('제보 커뮤니티 이름이 카드에 나온다', () => {
    // 5개 쿼리 전부 provider 를 select 한다(home-sdui-five-queries-card-coverage)
    const texts = textsOf(render('GRID', live.hotdeal));
    const providers = new Set(
      live.hotdeal.map(p => p.provider?.nameKr).filter(Boolean),
    );
    const shown = [...providers].filter(name => texts.includes(name as string));
    expect(shown.length).toBeGreaterThan(0);
  });

  it('mallName 이 없는 상품도 줄이 성립한다(슬롯 생략)', () => {
    const noMall: ProductCardType[] = [{...live.hotdeal[0], mallName: null}];
    expect(() => render('GRID', noMall)).not.toThrow();
  });
});

describe('토스 특가 카드 — 실데이터', () => {
  const {toTossDeal} = require('../src/entities/home/lib/toss');

  it('실 딜이 TossDeal 로 변환된다', () => {
    const deals = (live as any).toss.map(toTossDeal);
    expect(deals.length).toBeGreaterThan(0);
    for (const d of deals) {
      expect(typeof d.price).toBe('number');
      // ★unitPrice 는 반드시 문자열이어야 한다 — 객체면 Text 에서 크래시한다
      if (d.unitPrice !== undefined) expect(typeof d.unitPrice).toBe('string');
      expect(Number.isFinite(d.productId)).toBe(true);
    }
  });
});

describe('실데이터의 까다로운 값들', () => {
  it('가격이 비정형이어도 parsePrice 규칙대로 나온다', () => {
    const odd: ProductCardType[] = [
      {...live.hotdeal[0], id: 'a', price: '$ 2.67 (USD)'},
      {...live.hotdeal[0], id: 'b', price: '선택'},
      {...live.hotdeal[0], id: 'c', price: null},
      {...live.hotdeal[0], id: 'd', price: '삼성카드46,080'},
    ];
    const texts = textsOf(render('GRID', odd));
    expect(texts).toContain('$ 2.67 (USD)'); // 외화는 원을 안 붙인다
    expect(texts).toContain('선택');
    expect(texts).toContain('커뮤니티 확인'); // null
    expect(texts).toContain('46,080원'); // 첫 숫자 덩어리
  });

  it('제목이 아주 길어도 렌더된다', () => {
    const longest = live.hotdeal.reduce((a, b) =>
      a.title.length > b.title.length ? a : b,
    );
    expect(() => render('GRID', [longest])).not.toThrow();
  });
});
