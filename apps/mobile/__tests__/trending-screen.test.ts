/**
 * 발견 탭 네이티브 전환. web: app/(desktop-ready)/trending/{live,ranking}
 *
 * 여기서 지키는 건 "옮기다 빠뜨리기 쉬운 접합부"다 —
 * 탭이 웹뷰에서 네이티브로 바뀌면 URL 주입에 기대던 경로가 조용히 죽는다
 * (주입은 ref 가 null 이어도 예외를 내지 않는다).
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const web = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

const screen = read('src/screens/trending/TrendingScreen.tsx');
const queries = read('src/entities/trending/api/trending.queries.ts');
const rankingList = read('src/entities/trending/ui/RankingList.tsx');
const liveList = read('src/entities/trending/ui/LiveList.tsx');
const stack = read('src/navigations/tab/TabStackNavigator.tsx');
const flags = read('src/constants/feature-flags.ts');

describe('탭 배선', () => {
  it('발견 탭 루트가 플래그로 네이티브/웹뷰를 고른다', () => {
    expect(flags).toContain('NATIVE_DISCOVER');
    expect(stack).toContain(
      'NATIVE_DISCOVER && tabName === tabNavigations.DISCOVER',
    );
    expect(stack).toContain('<TrendingScreen />');
  });

  it('★웹뷰 폴백이 남아 있다 — 플래그를 되돌릴 수 있어야 한다', () => {
    expect(stack).toContain('<TabWebView tabName={tabName}');
  });
});

describe('★웹뷰 주입에 기대던 경로를 전부 옮겼다', () => {
  it('★발견 탭 재탭 = 실시간↔랭킹 전환', () => {
    // 웹뷰 ref 가 없으면 injectJavaScript 는 조용히 아무 일도 안 한다.
    // 발견 탭 재탭은 맨 위로가 아니라 화면 전환이다(사용자 지시 2026-08-18).
    const nav = read('src/navigations/tab/MainTabNavigator.tsx');
    expect(nav).toContain('toggleTrendingView');
    // 다른 탭에서 넘어올 때는 기본 화면(실시간)으로
    expect(nav).toContain('requestTrendingView');
  });

  it('★view 는 store 가 정본 — 화면이 useState 로 갖지 않는다', () => {
    // 두 곳에 값이 생기면 탭바가 "지금 무엇을 보고 있나"를 몰라 토글이 불가능하다.
    expect(screen).toContain('useTrendingView()');
    expect(screen).not.toContain('useState<TrendingView>');
    // 탭을 직접 눌러 고른 것도 store 로 들어가야 정본이 유지된다
    expect(screen).toContain('onSelect={requestTrendingView}');
  });

  it('토글이 두 값을 왕복한다', () => {
    const store = read('src/screens/trending/trending-view-store.ts');
    expect(store).toContain("requestedView === 'live' ? 'ranking' : 'live'");
  });

  it('딥링크·푸시(/trending/*)가 네이티브 탭으로 간다', () => {
    // 그대로 두면 FCMHandler 가 활성 탭 웹뷰로 폴백해 **엉뚱한 탭 안에**
    // trending 페이지를 띄운다(탭 아이콘은 홈, 내용은 랭킹).
    const ref = read('src/navigations/navigation-ref.ts');
    const fcm = read('src/components/FCMHandler.tsx');
    expect(ref).toContain('export function navigateToTrending');
    expect(fcm).toContain('navigateToTrending');
    // 콜드스타트·포그라운드·딥링크 3경로 모두
    expect(fcm.match(/navigateToTrending/g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('다른 탭 웹뷰 안의 /trending 링크도 네이티브로 올린다', () => {
    // 웹뷰 안에서 열게 두면 같은 목록이 두 벌 보이고, 웹 버전은 이제 낡는다.
    const tabWebView = read('src/screens/tabs/TabWebView.tsx');
    expect(tabWebView).toContain('navigateToTrending');
    // 문서 로드(URL 필터) + SPA(pushState) 두 경로 모두
    expect(
      tabWebView.match(/navigateToTrending/g)?.length,
    ).toBeGreaterThanOrEqual(2);
  });
});

describe('web 과 같은 데이터 규칙', () => {
  it("'전체' 탭은 categoryId 를 null 로 보낸다", () => {
    // 0 을 그대로 넘기면 백엔드가 실제 카테고리로 취급해 결과가 항상 빈다.
    expect(queries).toContain('categoryId === 0 ? null : categoryId');
  });

  it('★물량 적은 카테고리는 60일까지 넓힌다 — web 과 같은 목록', () => {
    const webServer = web('widgets/trending/ui/trending-container/server.tsx');
    // web 이 쓰는 카테고리 목록과 같아야 한다(갈리면 앱 목록이 비어 보인다).
    for (const id of [3, 5, 7, 8, 10]) {
      expect(webServer).toContain(String(id));
      expect(queries).toContain(String(id));
    }
    expect(queries).toContain('60');
  });

  it('페이지 크기가 web 과 같다 (실시간 20 · 랭킹 50)', () => {
    expect(queries).toContain('LIVE_LIMIT = 20');
    expect(queries).toContain('RANKING_LIMIT = 50');
    expect(queries).toContain('RANKING_SPLIT = 10');
  });

  it('★startDate 는 자정 기준 — 시각이 들어가면 캐시가 매번 미스', () => {
    expect(queries).toContain('setHours(0, 0, 0, 0)');
  });
});

describe('CTR 계측 (web 과 같은 출처·규칙)', () => {
  it("랭킹 출처가 web 과 같은 'ranking_tab'", () => {
    // 백엔드 집계가 이 문자열로 필터한다. 갈리면 분모가 사라진다.
    const webList = web('widgets/trending/ui/TrendingList.tsx');
    expect(webList).toContain("'ranking_tab'");
    expect(rankingList).toContain("'ranking_tab'");
  });

  it('노출은 화면에 보인 카드만 — 50개를 다 세지 않는다', () => {
    expect(rankingList).toContain('recordImpression');
    expect(liveList).toContain('onViewableIndexes');
    const grid = read('src/entities/home/ui/CurationGrid.tsx');
    expect(grid).toContain('itemVisiblePercentThreshold: 50');
  });

  it('★두 번째 그리드는 캐러셀 아래라 그리드 y 를 더한다', () => {
    // 안 더하면 11위 이후 노출이 전부 첫 화면으로 계산된다.
    expect(rankingList).toContain(
      'gridTopRef.current + e.nativeEvent.layout.y',
    );
  });

  it('★카테고리를 바꾸면 dedup 집합을 버린다', () => {
    // 유지하면 새 카테고리 상단이 "이미 본 것"이 되어 분모가 빈다.
    expect(screen).toContain('key={`live-${activeCategoryId}`}');
    expect(screen).toContain('key={`ranking-${activeCategoryId}`}');
  });
});

describe('상단 실시간/랭킹 탭 — web 대조', () => {
  const tabs = read('src/entities/trending/ui/TrendingTopTabs.tsx');
  const webTabs = web('widgets/trending/ui/PageTabNavigation.tsx');

  it('★★flex 를 className 이 아니라 style 로 준다 — 안 그러면 탭이 안 보인다', () => {
    // 🔴 실제로 겪은 버그: PressableScale 의 className 은 **안쪽** View 가 받으므로
    // flex-1 을 className 으로 주면 바깥 Pressable 폭이 0 이 되어 탭 두 개가
    // 통째로 사라진다(좌상단에 눌린 흔적만 남음). 사용자가 "랭킹/실시간이
    // 없네 헤더가" 로 지적.
    const block = tabs.slice(
      tabs.indexOf('<PressableScale'),
      tabs.indexOf('</PressableScale>'),
    );
    expect(block).toContain('style={{flex: 1}}');
    expect(block).not.toContain('className="flex-1');
  });

  it('web 과 같은 라벨·경계선', () => {
    for (const label of ['실시간', '랭킹']) {
      expect(webTabs).toContain(label);
      expect(tabs).toContain(label);
    }
    // 경계선은 PageTabNavigation 자신의 값(gray-200). PageHeader 의 gray-100 아님.
    expect(webTabs).toContain('border-b border-gray-200');
    expect(tabs).toContain('border-b border-gray-200');
  });

  it('★글자색·밑줄은 web 과 같은 "값" — 클래스 이름이 아니다', () => {
    // 애니메이션 때문에 Animated 컴포넌트를 쓰고, NativeWind 4 는 Animated 에
    // 준 className 을 **조용히 무시**하므로 style 로 쓴다. 그래서 대조 대상은
    // 클래스 문자열이 아니라 색상 값이다.
    // web: text-gray-900 = #101828, text-gray-500 = #667085
    expect(webTabs).toContain('text-gray-900');
    expect(webTabs).toContain('text-gray-500');
    expect(tabs).toContain("COLOR_ACTIVE = '#101828'");
    expect(tabs).toContain("COLOR_INACTIVE = '#667085'");

    // 밑줄: web h-0.5(2px) + bg-gray-900
    expect(webTabs).toContain('h-0.5 bg-gray-900');
    expect(tabs).toContain('height: 2');
    expect(tabs).toContain('backgroundColor: COLOR_ACTIVE');
  });

  it('★밑줄은 하나를 움직인다 — 탭마다 그리면 순간이동이 된다', () => {
    // 탭 2개가 같은 폭이라 onLayout 측정 없이 left 0%↔50% 로 끝난다.
    expect(tabs).toContain("width: '50%'");
    expect(tabs).toContain('progress.value * 50');
    // 글자색도 같은 progress 로 보간해야 밑줄과 함께 움직인다
    expect(tabs).toContain('interpolateColor');
  });

  it('★NativeWind 는 Animated 에 준 className 을 무시한다 — style 로 쓴다', () => {
    // 이걸 어기면 스타일이 조용히 사라진다(에러 없음).
    // ★주석에도 'className' 이라는 낱말이 나오므로 **속성 형태**로만 찾는다
    //   (`className=`). 주석까지 걸면 거짓 양성이 난다 — 실제로 한 번 겪었다.
    expect(tabs).toMatch(/<Animated\.(View|Text)\b/);
    const attrHits = tabs.match(/<Animated\.(?:View|Text)\b[\s\S]*?>/g) ?? [];
    expect(attrHits.length).toBeGreaterThan(0);
    for (const tag of attrHits) {
      // 주석 줄(//)을 걷어낸 뒤 className= 속성이 있나 본다.
      const withoutComments = tag.replace(/\/\/[^\n]*/g, '');
      expect(withoutComments).not.toContain('className=');
    }
  });

  it('★헤더 높이가 web PageHeader(h-14)와 같다', () => {
    // web 은 탭 줄이 PageHeader 의 유일한 children 이라 실제 높이가 56px 이다.
    const header = fs.readFileSync(
      path.join(__dirname, '../../web/src', 'shared/ui/layout/PageHeader.tsx'),
      'utf8',
    );
    expect(header).toContain("PAGE_HEADER_HEIGHT_CLASS = 'h-14'");
    expect(tabs).toContain('h-14');
  });
});

describe('선호 카테고리', () => {
  it('선호가 있으면 그것만, 없으면 전체 (web 과 같은 폴백)', () => {
    const cat = read('src/entities/category/category.queries.ts');
    expect(cat).toContain('favorites.length > 0');
    // 조회 실패는 삼키고 전체로 — 카테고리 줄이 통째로 사라지면 안 된다.
    expect(cat).toContain('catch');
  });

  it('★사라진 카테고리를 보고 있었으면 전체로 떨어진다', () => {
    // 그대로 두면 어떤 칩도 활성이 아니고 목록이 빈다.
    expect(screen).toContain('allCategories.some(c => c.id === categoryId)');
  });
});

export {};
