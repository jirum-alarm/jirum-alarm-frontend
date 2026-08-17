/**
 * 토스 특가 더보기 네이티브 화면 + 목록 화면 공통화.
 *
 * 카드는 공유하지 않고(토스는 data.toss 전용) 그리드 껍데기만 공유한다.
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');

const {TOSS_SECTION_KEYWORD} = require('../src/entities/home/lib/toss');

const home = read('src/screens/home/HomeScreen.tsx');
const tossScreen = read('src/screens/curation/TossCurationScreen.tsx');
const curationScreen = read('src/screens/curation/CurationScreen.tsx');
const grid = read('src/entities/home/ui/CurationGrid.tsx');
const stack = read('src/navigations/tab/TabStackNavigator.tsx');

describe('★홈에서 웹뷰가 사라졌다', () => {
  it('/toss 는 네이티브 화면으로', () => {
    expect(home).toContain('tabStackNavigations.TOSS_CURATION');
  });

  it('/curation/* 도 네이티브 화면으로', () => {
    expect(home).toContain('tabStackNavigations.CURATION');
  });

  it('두 라우트가 탭 스택에 등록돼 있다', () => {
    expect(stack).toContain('TossCurationScreen');
    expect(stack).toContain('CurationScreen');
  });
});

describe('★그리드는 공유, 카드는 분리', () => {
  it('두 화면이 같은 CurationGrid 를 쓴다', () => {
    expect(curationScreen).toContain('CurationGrid');
    expect(tossScreen).toContain('CurationGrid');
  });

  it('★카드는 각자 다르다 — 공유 필드가 title·price 뿐이라', () => {
    expect(curationScreen).toContain('GridCard');
    expect(tossScreen).toContain('TossDealCard');
  });

  it('그리드가 카드를 주입받는다(하드코딩 안 함)', () => {
    expect(grid).toContain('renderCard');
    // 특정 카드에 묶이지 않았다
    expect(grid).not.toContain('GridCard');
    expect(grid).not.toContain('TossDealCard');
  });

  it('토스는 3열, 큐레이션은 기본 2열', () => {
    expect(tossScreen).toContain('columns={3}');
    expect(grid).toContain('columns = 2');
  });
});

describe('토스 섹션·무한스크롤', () => {
  it('섹션 8종 키워드가 그대로다', () => {
    expect(Object.keys(TOSS_SECTION_KEYWORD)).toHaveLength(8);
    expect(TOSS_SECTION_KEYWORD.daily).toBe('토스_하루특가');
  });

  it('카테고리 인기는 하위 탭이 2단이다', () => {
    expect(tossScreen).toContain("CATEGORY_SECTION_ID = 'category'");
    expect(tossScreen).toContain('variant="sub"');
  });

  it('섹션을 바꾸면 하위 카테고리를 초기화한다', () => {
    expect(tossScreen).toContain('setActiveCat(undefined)');
  });

  it('무한스크롤은 onEndReached', () => {
    expect(tossScreen).toContain('fetchNextPage');
    expect(grid).toContain('onEndReached');
  });
});

export {};
