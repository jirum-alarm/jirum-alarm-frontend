/**
 * 홈 SDUI — 앱이 쓰는 섹션 모델·매핑·폴백 카탈로그(정본 @jirum/domain/home-sections)의 동작.
 *
 * 섹션 구성이나 표기가 web 과 갈리면 유저는 버그로 읽는다(partial-ui-rollout-reads-as-bug).
 * 예전엔 web 소스를 직접 읽어 대조했지만, 이제 두 앱이 같은 정본을 import 한다.
 */
const fs = require('fs');
const path = require('path');

// @types/node 를 안 깔아서 tsc 가 __dirname 을 모른다(jest 런타임엔 있다).
declare const __dirname: string;

const {
  buildPromotionSections,
} = require('../src/entities/home/model/promotion-sections');
const {
  findPromotionSectionById,
} = require('../src/entities/home/model/promotion-sections');
const {mapHomePageSections} = require('../src/entities/home/lib/map-home-page');
const {
  toTossDeal,
  TOSS_HOME_SECTION_IDS,
  stripPriceFromTitle,
} = require('../src/entities/home/lib/toss');

describe('섹션 구성 — web getPromotionSections 와 동일', () => {
  const empty = {communityProviders: [], mallGroups: []};

  it('섹션 id 와 순서가 web 과 같다', () => {
    const ids = buildPromotionSections(empty).map((s: {id: string}) => s.id);
    expect(ids).toEqual([
      'toss',
      'time-deal',
      'overseas-sale',
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
      toss: 'TOSS',
      'time-deal': 'HORIZONTAL_SCROLL',
      'overseas-sale': 'HORIZONTAL_SCROLL',
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

// web 과 같아야 하는 섹션 id·타입·토스 키워드·LIST 개수·제목 높이는 이제 정본에서 둘 다 읽는다
// (@jirum/domain/home-sections·toss, 디자인 시스템 productCard.titleBox) — web 소스 대조는 지웠다.
// 렌더러가 정본 타입을 전부 다루는지는 web·앱 DynamicProductList 의 never 가드(tsc)가 본다.
describe('홈 토스 섹션', () => {
  it('공식 Open API 3탭만 노출한다', () => {
    expect([...TOSS_HOME_SECTION_IDS]).toEqual(['daily', 'best', 'category']);
    expect(
      fs.readFileSync(
        path.join(__dirname, '../src/entities/home/ui/TossHomeSection.tsx'),
        'utf8',
      ),
    ).toContain('homeSections');
  });
});

describe('토스 딜 변환(정본 @jirum/domain/toss)', () => {
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

  it('제목에 붙은 판매가를 뗀다', () => {
    expect(
      toTossDeal({
        id: '1',
        title: '숫꽃게 중짜 1kg당 4-6미 2kg 1개 23,800원',
        data: null,
      }).title,
    ).toBe('숫꽃게 중짜 1kg당 4-6미 2kg 1개');
  });
});

describe('stripPriceFromTitle', () => {
  it('쉼표 가격·단위가를 떼고 원피스는 남긴다', () => {
    expect(stripPriceFromTitle('돈까스 420g 2팩 14,800원')).toBe(
      '돈까스 420g 2팩',
    );
    expect(stripPriceFromTitle('두부과자 110g 5개 100g당 2,092원')).toBe(
      '두부과자 110g 5개',
    );
    expect(stripPriceFromTitle('원피스 블랙')).toBe('원피스 블랙');
    expect(stripPriceFromTitle('치약 9900원')).toBe('치약');
  });
});

describe('더보기 — 서버에만 있는 섹션', () => {
  it('★로컬 카탈로그에 없는 id 도 서버 homePage 섹션에서 찾는다', () => {
    // 2026-10-15: 홈은 서버 섹션이라 「선착순·타임특가」가 보였는데, 더보기는 로컬 카탈로그만 봐서
    // OTA 전 번들에선 「페이지를 찾을 수 없어요」였다. CurationScreen 이 이 순서로 찾는다.
    const server = mapHomePageSections([
      {
        id: 'brand-new',
        title: '새 섹션',
        type: 'HORIZONTAL_SCROLL',
        viewMoreLink: '/curation/brand-new',
        dataSource: {
          type: 'GRAPHQL_QUERY',
          queryName: 'productsByKeyword',
          variables: {keyword: '새키워드'},
        },
      },
    ]);
    const local = buildPromotionSections({
      communityProviders: [],
      mallGroups: [],
    });
    expect(findPromotionSectionById(local, 'brand-new')).toBeUndefined();
    const found = findPromotionSectionById(server, 'brand-new');
    expect(found?.dataSource.variables).toEqual({keyword: '새키워드'});
  });
});
