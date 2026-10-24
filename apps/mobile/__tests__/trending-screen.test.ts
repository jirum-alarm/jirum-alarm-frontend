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

const screen = read('src/screens/trending/TrendingScreen.tsx');
const queries = read('src/entities/trending/api/trending.queries.ts');
const rankingList = read('src/entities/trending/ui/RankingList.tsx');
const feedList = read('src/screens/trending/FeedList.tsx');
const stack = read('src/navigations/tab/TabStackNavigator.tsx');

describe('탭 배선', () => {
  it('발견 탭 루트는 네이티브 화면이다', () => {
    // 플래그(constants/feature-flags.ts)는 2026-09-07 에 지웠다 — 탭 이름으로
    // 직접 고른다. 되돌릴 일이 생기면 해당 커밋을 eas update 로 내보낸다.
    // 탭별 컴포넌트 표(NATIVE_TAB_ROOTS) — 렌더 콜백은 루트를 매번 다시 그리게 했다.
    expect(stack).toContain('[tabNavigations.DISCOVER]: TrendingScreen');
  });

  it('★웹뷰 폴백이 남아 있다 — 커뮤니티·내정보는 아직 웹뷰다', () => {
    // ⚠️한 줄 문자열로 검사하면 포맷(줄바꿈)만 바뀌어도 깨진다 — 존재로 본다.
    expect(stack).toMatch(/<TabWebView/);
    expect(stack).toMatch(/tabName=\{tabName\}/);
  });
});

describe('★웹뷰 주입에 기대던 경로를 전부 옮겼다', () => {
  it('★발견 탭 재탭 = 실시간↔랭킹 전환', () => {
    // 웹뷰 ref 가 없으면 injectJavaScript 는 조용히 아무 일도 안 한다.
    // 발견 탭 재탭은 맨 위로가 아니라 화면 전환이다(사용자 지시 2026-08-18).
    const nav = read('src/navigations/tab/MainTabNavigator.tsx');
    expect(nav).toContain('toggleTrendingView');
  });

  it('★다른 탭에서 발견 탭을 누르면 랭킹 — web 하단 네비(/trending/ranking)와 같다', () => {
    // 규칙은 정본 nextTrendingView 하나 — web 하단 네비 링크도 같은 함수를 쓴다.
    const {nextTrendingView} = require('@jirum/domain/ranking');
    expect(nextTrendingView(null)).toBe('ranking');
    expect(nextTrendingView('live')).toBe('ranking');
    expect(nextTrendingView('hot')).toBe('ranking');
    expect(nextTrendingView('ranking')).toBe('hot');
    const nav = read('src/navigations/tab/MainTabNavigator.tsx');
    const block = nav.slice(
      nav.indexOf('const handleNavigateToRoot'),
      nav.indexOf('const onTabPress'),
    );
    expect(block).toContain('requestTrendingView(nextTrendingView(null))');
    // 재탭 전환도 같은 규칙.
    expect(read('src/shared/lib/navigation/trending-view-store.ts')).toContain(
      'nextTrendingView(requestedView)',
    );
  });

  it('★카테고리도 store 가 정본 — 밖(?tab=N)에서 지정할 수 있다', () => {
    expect(screen).toContain('useTrendingCategory()');
    // 칩 선택은 이벤트를 남긴 뒤 store 로 보낸다(화면 state 가 아니다).
    expect(screen).toContain('onSelect={handleSelectCategory}');
    expect(screen).toContain('requestTrendingCategory(id)');
    expect(screen).not.toContain('useState<number>(ALL_CATEGORY.id)');
  });

  it('★view 는 store 가 정본 — 화면이 useState 로 갖지 않는다', () => {
    // 두 곳에 값이 생기면 탭바가 "지금 무엇을 보고 있나"를 몰라 토글이 불가능하다.
    expect(screen).toContain('useTrendingView()');
    expect(screen).not.toContain('useState<TrendingView>');
    // 탭을 직접 눌러 고른 것도 store 로 들어가야 정본이 유지된다
    expect(screen).toContain('onSelect={requestTrendingView}');
  });

  it('토글이 두 값을 왕복한다', () => {
    const store = read('src/shared/lib/navigation/trending-view-store.ts');
    expect(store).toContain('nextTrendingView(requestedView)');
  });

  it('딥링크·푸시(/trending/*)가 네이티브 탭으로 간다', () => {
    // 그대로 두면 FCMHandler 가 활성 탭 웹뷰로 폴백해 **엉뚱한 탭 안에**
    // trending 페이지를 띄운다(탭 아이콘은 홈, 내용은 랭킹).
    const ref = read('src/shared/lib/navigation/navigation-ref.ts');
    const fcm = read('src/components/FCMHandler.tsx');
    const routing = read('src/shared/lib/navigation/tab-routing.ts');
    // 판정은 resolveNativeRoute 한 곳, 실행은 navigateToNativeRoute.
    expect(routing).toContain("path.startsWith('/trending')");
    expect(routing).toContain('trendingView');
    expect(ref).toContain('export function navigateToNativeRoute');
    // 푸시·딥링크는 한 입구(openWhenNavigatorReady)를 거쳐 navigateToNativeRoute 로 간다.
    const ready = read('src/shared/lib/navigation/open-when-ready.ts');
    const deepLink = read('src/shared/hooks/useDeepLink.ts');
    expect(ready).toContain(
      'navigateToNativeRoute(url, {allowWebViewRoute: true})',
    );
    expect(fcm).toContain('openWhenNavigatorReady(url, openInWebView');
    expect(deepLink).toContain('openWhenNavigatorReady(');
    // 콜드스타트·백그라운드·포그라운드 3경로 모두
    expect(fcm.match(/openNotificationUrl\(/g)?.length).toBeGreaterThanOrEqual(
      3,
    );
    // 웹뷰 안 링크 클릭용 입구는 따로 남아 있다(TabWebView 가 쓴다).
    expect(ref).toContain('export function navigateToTrending');
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

  it('★물량 적은 카테고리는 60일까지 넓힌다 — 며칠 볼지는 web 과 같은 정본(@jirum/domain/ranking)', () => {
    expect(queries).toMatch(
      /import \{[^}]*\brankingWindowDays\b[^}]*\} from '@jirum\/domain\/ranking'/,
    );
    expect(queries).toContain('rankingWindowDays(categoryId)');
    expect(queries).not.toContain('EXTEND_START_DATE_CATEGORIES');
    const {rankingWindowDays} = require('@jirum/domain/ranking');
    expect(rankingWindowDays(3)).toBe(60);
    expect(rankingWindowDays(null)).toBe(3);
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
  it("랭킹 출처는 정본 RANKING_CARD_SOURCE('ranking_tab') — web 목록도 같은 상수", () => {
    // 백엔드 집계가 이 문자열로 필터한다. 갈리면 분모가 사라진다.
    const {RANKING_CARD_SOURCE} = require('@jirum/domain/ranking');
    expect(RANKING_CARD_SOURCE).toBe('ranking_tab');
    expect(rankingList).toContain('RANKING_CARD_SOURCE');
  });

  it('노출은 화면에 보인 카드만 — 50개를 다 세지 않는다', () => {
    expect(rankingList).toContain('recordImpression');
    expect(feedList).toContain('onViewableIndexes');
    const grid = read('src/entities/home/ui/CurationGrid.tsx');
    expect(grid).toContain('itemVisiblePercentThreshold: 50');
  });

  it('★랭킹 노출·순위는 줄 목록이 정한다 — 11위 이후도 position 이 이어진다', () => {
    // 예전엔 카드 onLayout y + 그리드 y 로 계산했다(빼먹으면 11위 이후가 전부 첫 화면으로 셈).
    // 이제 FlatList 줄마다 positionFrom 을 들고 있다 — 실제 동작은 ranking-list.test 가 렌더해서 본다.
    expect(rankingList).toContain('onViewableItemsChanged');
    expect(rankingList).toContain('item.positionFrom + i');
  });

  it('★카테고리를 바꾸면 dedup 집합을 버린다', () => {
    // 유지하면 새 카테고리 상단이 "이미 본 것"이 되어 분모가 빈다. 「핫딜만」 칩을 바꿔도(hot↔live) 새로 센다.
    expect(screen).toContain('key={`${view}-${category.id}`}');
    expect(screen).toContain('key={`ranking-${category.id}`}');
  });

  it('★좌우 스와이프 페이저는 보고 있는 페이지의 목록만 그린다', () => {
    // 옆 페이지 목록까지 그리면 가로로 화면 밖인데도 onViewableItemsChanged 가 "보였다"로 세서
    // 노출 분모가 부푼다. 옆 페이지는 스켈레톤.
    const pager = read('src/entities/trending/ui/CategoryPager.tsx');
    expect(pager).toContain('pagingEnabled');
    expect(pager).toContain(
      'item.id === activeId ? renderPage(item) : renderPlaceholder()',
    );
    expect(screen).toContain('onSwipeTo={handleSwipeCategory}');
    // 스와이프로 바꾼 것도 store 를 거친다(칩과 같은 입구).
    expect(screen).toContain("selectCategory(id, 'swipe')");
  });
});

describe('상단 실시간/랭킹 탭 — web 대조', () => {
  const tabs = read('src/entities/trending/ui/TrendingTopTabs.tsx');

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

  it('라벨·경계선(web PageTabNavigation 과 같은 gray-200 — PageHeader 의 gray-100 아님)', () => {
    // 순서·이름은 web 과 같은 정본(TRENDING_VIEW_TABS)에서 읽는다.
    expect(tabs).toContain('TRENDING_VIEW_TABS');
    const {TRENDING_VIEW_TABS} = require('@jirum/domain/ranking');
    expect(TRENDING_VIEW_TABS.map((t: {label: string}) => t.label)).toEqual([
      '실시간',
      '랭킹',
    ]);
    // 실시간(live)·핫딜만(hot)은 둘 다 「실시간」 탭 — 칩은 카테고리 줄 끝(TrendingScreen).
    expect(tabs).toContain('trendingTabView(active)');
    expect(screen).toContain(
      "requestTrendingView(view === 'hot' ? 'live' : 'hot')",
    );
    expect(tabs).toContain('border-b border-gray-200');
  });

  it('★글자색·밑줄은 web 과 같은 "값" — 클래스 이름이 아니다', () => {
    // 애니메이션 때문에 Animated 컴포넌트를 쓰고, NativeWind 4 는 Animated 에
    // 준 className 을 **조용히 무시**하므로 style 로 쓴다. 그래서 대조 대상은
    // 클래스 문자열이 아니라 색상 값이다.
    // web 과 같은 gray-900(선택)·gray-500 — 앱은 같은 토큰 값을 palette(useColors)에서 받는다(다크모드).
    expect(tabs).toContain('[c.gray[900], c.gray[500]]');

    // 밑줄: web 과 같은 2px gray-900
    expect(tabs).toContain('height: 2');
    expect(tabs).toContain('backgroundColor: c.gray[900]');
  });

  it('★밑줄은 하나를 움직인다 — 탭마다 그리면 순간이동이 된다', () => {
    // 탭이 같은 폭이라 onLayout 측정 없이 left = 인덱스 × 탭 폭으로 끝난다.
    expect(tabs).toContain('TAB_WIDTH_PERCENT = 100 / TABS.length');
    expect(tabs).toContain('width: `${TAB_WIDTH_PERCENT}%`');
    expect(tabs).toContain('progress.value * TAB_WIDTH_PERCENT');
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

  it('★헤더 높이는 web PageHeader 와 같은 레시피(pageHeader.height)', () => {
    // web 은 탭 줄이 PageHeader 의 유일한 children 이라 실제 높이가 그 높이다.
    expect(tabs).toContain('pageHeader.height');
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
