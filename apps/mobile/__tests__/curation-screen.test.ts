/**
 * 더보기(큐레이션) 네이티브 화면.
 *
 * 웹뷰를 탭 스택에 끼웠더니 접합부 버그가 5건 났다(URL 이중접두·헤더 중복·
 * 탭바 소실·상세 유실 등). 홈과 같은 데이터·카드를 쓰므로 네이티브로 옮겼다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const readWeb = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const {
  supportsInfinite,
  CURATION_LIMIT,
} = require('../src/entities/home/lib/curation');
const {
  buildPromotionSections,
  findPromotionSectionById,
} = require('../src/entities/home/model/promotion-sections');

const screen = read('src/screens/curation/CurationScreen.tsx');
const home = read('src/screens/home/HomeScreen.tsx');

describe('커서 페이지네이션 지원 여부 — web 과 같다', () => {
  it('3종만 무한스크롤', () => {
    expect(supportsInfinite('productsByKeyword')).toBe(true);
    expect(supportsInfinite('products')).toBe(true);
    expect(supportsInfinite('expiringSoonHotDealProducts')).toBe(true);
  });

  it('page 기반 2종은 단일 조회 — web 도 그렇다', () => {
    expect(supportsInfinite('hotDealRankingProducts')).toBe(false);
    expect(supportsInfinite('guestRecommendedHotDeals')).toBe(false);

    const web = readWeb(
      'app/(desktop-ready)/curation/components/CurationProductList.tsx',
    );
    // web 도 이 둘만 useSuspenseQuery(단일)를 쓴다
    expect(web).toContain('ByHotDeal');
    expect(web).toContain('ByGuestRecommended');
  });

  it('LIMIT 이 web 과 같은 20', () => {
    const web = readWeb(
      'app/(desktop-ready)/curation/components/CurationProductList.tsx',
    );
    expect(web).toContain('const LIMIT = 20');
    expect(CURATION_LIMIT).toBe(20);
  });
});

describe('섹션 id 조회 — GROUP 안쪽과 탭까지 뒤진다', () => {
  const sections = buildPromotionSections({
    communityProviders: [{id: '2', name: 'coolenjoy', nameKr: '쿨엔조이'}],
    mallGroups: [{id: 3, title: '알리', isActive: true, sort: 1}],
  });

  it('최상위 섹션', () => {
    expect(findPromotionSectionById(sections, 'hotdeal')?.title).toBe(
      '놓치면 아까운 핫딜',
    );
  });

  it('GROUP 안쪽 섹션', () => {
    expect(findPromotionSectionById(sections, 'impending')?.title).toBe(
      '유통기한 임박 특가',
    );
    expect(findPromotionSectionById(sections, 'premium')?.title).toBe(
      '프리미엄 핫딜',
    );
  });

  it('★탭이면 그 탭 variables 를 섞은 GRID 로 만든다', () => {
    const tab = findPromotionSectionById(sections, 'mall-group-3');
    expect(tab?.type).toBe('GRID');
    expect(tab?.dataSource.variables).toMatchObject({mallGroupId: 3});
  });

  it('없는 id 는 undefined', () => {
    expect(findPromotionSectionById(sections, 'nope')).toBeUndefined();
  });
});

describe('홈에서 더보기 라우팅', () => {
  it('/curation/* 은 네이티브 화면으로', () => {
    expect(home).toContain('tabStackNavigations.CURATION');
    expect(home).toContain('/curation/');
  });

  it('나머지(토스 등)는 아직 웹뷰', () => {
    expect(home).toContain('tabStackNavigations.WEBVIEW');
  });

  it('무한스크롤은 onEndReached 로(web 은 useInView 센티넬)', () => {
    expect(screen).toContain('onEndReached');
    // 주석엔 web 대비 설명으로 등장하므로 import 여부로 판정한다.
    expect(screen).not.toMatch(/^import .*useInView/m);
  });
});

export {};
