/**
 * 홈 SDUI 의 web 대조 테스트.
 *
 * 홈이 네이티브가 돼도 발견·커뮤니티 탭은 웹뷰라 같은 카드가 두 벌로 존재한다.
 * 섹션 구성이나 표기가 갈리면 유저는 버그로 읽는다
 * (partial-ui-rollout-reads-as-bug). 그래서 web 소스를 직접 읽어 대조한다.
 *
 * 컴포넌트를 렌더하면 RN 의존이 줄줄이 딸려오므로 순수 로직과 소스 텍스트만 본다
 * (frontend-test-runner-dayjs-esm-gap 와 같은 이유).
 */
const fs = require('fs');
const path = require('path');

// @types/node 를 안 깔아서 tsc 가 __dirname 을 모른다(jest 런타임엔 있다).
declare const __dirname: string;

const {
  buildPromotionSections,
} = require('../src/entities/home/model/promotion-sections');
const {
  toTossDeal,
  TOSS_SECTION_KEYWORD,
} = require('../src/entities/home/lib/toss');

const WEB = path.join(__dirname, '../../web/src');
const readWeb = (p: string) => fs.readFileSync(path.join(WEB, p), 'utf8');

describe('섹션 구성 — web getPromotionSections 와 동일', () => {
  const empty = {communityProviders: [], mallGroups: []};

  it('섹션 id 와 순서가 web 과 같다', () => {
    const ids = buildPromotionSections(empty).map((s: {id: string}) => s.id);
    expect(ids).toEqual([
      'hotdeal',
      'guest-recommended',
      'under-10000',
      'group-1',
      'mall',
      'community',
    ]);
  });

  it('레이아웃 타입이 web 과 같다', () => {
    const sections = buildPromotionSections(empty);
    const byId = Object.fromEntries(
      sections.map((s: {id: string; type: string}) => [s.id, s.type]),
    );
    expect(byId).toMatchObject({
      hotdeal: 'PAGINATED_GRID',
      'guest-recommended': 'PAGINATED_GRID',
      'under-10000': 'HORIZONTAL_SCROLL',
      'group-1': 'GROUP',
      mall: 'GRID_TABBED',
      community: 'GRID_TABBED',
    });
  });

  it('GROUP 안에 impending(DOUBLE_ROW)·premium(LIST)', () => {
    const group = buildPromotionSections(empty).find(
      (s: {id: string}) => s.id === 'group-1',
    );
    expect(
      group.sections.map((s: {id: string; type: string}) => [s.id, s.type]),
    ).toEqual([
      ['impending', 'DOUBLE_ROW'],
      ['premium', 'LIST'],
    ]);
  });

  it('탭 소스가 없으면 키워드 폴백 탭을 쓴다(web Promise.allSettled 실패 경로)', () => {
    const sections = buildPromotionSections(empty);
    const mall = sections.find((s: {id: string}) => s.id === 'mall');
    const community = sections.find((s: {id: string}) => s.id === 'community');

    expect(mall.dataSource.queryName).toBe('productsByKeyword');
    expect(mall.tabs.map((t: {id: string}) => t.id)).toEqual([
      'ali',
      'coupang',
      'naver',
    ]);
    expect(community.tabs.map((t: {id: string}) => t.id)).toEqual([
      'ppomppu',
      'eomisae',
      'mamibebe',
    ]);
  });

  it('탭 소스가 있으면 products 쿼리로 갈아탄다', () => {
    const sections = buildPromotionSections({
      communityProviders: [{id: '2', name: 'coolenjoy', nameKr: '쿨엔조이'}],
      mallGroups: [{id: 3, title: '알리', isActive: true, sort: 1}],
    });
    const mall = sections.find((s: {id: string}) => s.id === 'mall');
    const community = sections.find((s: {id: string}) => s.id === 'community');

    expect(mall.dataSource.queryName).toBe('products');
    expect(mall.tabs[0].variables).toEqual({mallGroupId: 3});
    expect(community.dataSource.queryName).toBe('products');
  });

  it('★providerId 단수가 아니라 providerIds 복수로 보낸다', () => {
    // web 은 단수 providerId 를 넘기지만 스키마엔 복수형만 있다.
    // 운영 API 가 미선언 인자를 받아줘서 web 이 동작하는 것뿐 — 결과는 같다(실측 확인).
    const sections = buildPromotionSections({
      communityProviders: [{id: '2', name: 'coolenjoy', nameKr: '쿨엔조이'}],
      mallGroups: [],
    });
    const community = sections.find((s: {id: string}) => s.id === 'community');
    expect(community.tabs[0].variables).toEqual({providerIds: [2]});
  });

  it('비활성 몰그룹은 빼고 sort 순으로 정렬한다', () => {
    const sections = buildPromotionSections({
      communityProviders: [],
      mallGroups: [
        {id: 1, title: '나중', isActive: true, sort: 9},
        {id: 2, title: '꺼짐', isActive: false, sort: 1},
        {id: 3, title: '먼저', isActive: true, sort: 2},
      ],
    });
    const mall = sections.find((s: {id: string}) => s.id === 'mall');
    expect(mall.tabs.map((t: {label: string}) => t.label)).toEqual([
      '먼저',
      '나중',
    ]);
  });
});

describe('web 소스와 직접 대조', () => {
  it('web 이 쓰는 섹션 id 가 네이티브에도 전부 있다', () => {
    const src = readWeb('entities/promotion/api/getPromotionSections.ts');
    const webIds = [...src.matchAll(/^\s{4,6}id: '([a-z0-9-]+)',/gm)].map(
      (m: RegExpMatchArray) => m[1],
    );
    const nativeIds = JSON.stringify(
      buildPromotionSections({communityProviders: [], mallGroups: []}),
    );
    // 폴백 탭 id(ali/coupang/...)까지 포함해 전수 확인
    for (const id of webIds) {
      expect(nativeIds).toContain(`"${id}"`);
    }
  });

  it('web DynamicProductList 가 다루는 타입을 네이티브도 다룬다', () => {
    const src = readWeb('widgets/home/ui/DynamicProductList.tsx');
    const webTypes = [...src.matchAll(/type === '([A-Z_]+)'/g)].map(
      (m: RegExpMatchArray) => m[1],
    );
    const native = fs.readFileSync(
      path.join(__dirname, '../src/entities/home/ui/DynamicProductList.tsx'),
      'utf8',
    );
    for (const t of webTypes) {
      expect(native).toContain(`case '${t}'`);
    }
  });

  it('토스 섹션 키워드 매핑이 web 과 같다', () => {
    const src = readWeb('app/(desktop-ready)/toss/toss.api.ts');
    const block = src.slice(
      src.indexOf('TOSS_SECTION_KEYWORD'),
      src.indexOf('}', src.indexOf('TOSS_SECTION_KEYWORD')),
    );
    for (const [id, keyword] of Object.entries(TOSS_SECTION_KEYWORD)) {
      expect(block).toContain(`${id}: '${keyword}'`);
    }
  });

  it('LIST 는 web 처럼 4개까지만 그린다', () => {
    const web = readWeb('entities/product-list/ui/list/ListProductList.tsx');
    expect(web).toContain('slice(0, 4)');
    const native = fs.readFileSync(
      path.join(__dirname, '../src/entities/home/ui/DynamicProductList.tsx'),
      'utf8',
    );
    expect(native).toContain('slice(0, 4)');
  });

  it('제목 2줄 높이가 web h-12(48px)와 같다', () => {
    // web 카드가 h-12 를 쓰는데 네이티브가 40 이면 2줄이 잘리고
    // 아래 가격 줄이 카드마다 어긋난다.
    const web = readWeb('entities/product-list/ui/grid/ProductGridCard.tsx');
    expect(web).toContain('line-clamp-2 h-12');
    const native = fs.readFileSync(
      path.join(
        __dirname,
        '../src/entities/home/ui/cards/HomeCardPrimitives.tsx',
      ),
      'utf8',
    );
    expect(native).toContain('height: 48');
  });
});

describe('토스 딜 변환 — web toss.api.ts 와 동일', () => {
  it('salePrice 가 있으면 그걸 쓰고, 없으면 price 문자열에서 숫자를 뽑는다', () => {
    expect(
      toTossDeal({id: '1', title: 'a', price: '12,900원', data: null}).price,
    ).toBe(12900);
    expect(
      toTossDeal({
        id: '1',
        title: 'a',
        price: '12,900원',
        data: {toss: {salePrice: 9900}},
      }).price,
    ).toBe(9900);
  });

  it('★unitPrice 가 객체로 와도 문자열로 정규화한다', () => {
    // 그대로 Text 에 넣으면 크래시한다(web 에선 React #31 로 홈 전체가 죽었다).
    const deal = toTossDeal({
      id: '1',
      title: 'a',
      data: {
        toss: {unitPrice: {unitName: 'g', unitAmount: 100, unitPrice: 2092}},
      },
    });
    expect(deal.unitPrice).toBe('100g당 2,092원');
    expect(typeof deal.unitPrice).toBe('string');
  });

  it('unitPrice 가 문자열이면 그대로, 불완전하면 undefined', () => {
    expect(
      toTossDeal({
        id: '1',
        title: 'a',
        data: {toss: {unitPrice: '100g당 2,092원'}},
      }).unitPrice,
    ).toBe('100g당 2,092원');
    expect(
      toTossDeal({
        id: '1',
        title: 'a',
        data: {toss: {unitPrice: {unitPrice: 5}}},
      }).unitPrice,
    ).toBeUndefined();
  });

  it('data 가 없어도 죽지 않는다', () => {
    const deal = toTossDeal({id: '7', title: 'a', price: null, data: null});
    expect(deal.productId).toBe(7);
    expect(deal.price).toBe(0);
  });
});
