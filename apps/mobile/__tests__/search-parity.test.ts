export {};

/**
 * 검색 화면 웹뷰 → 네이티브 전환 대조.
 *
 * 여기서 지키는 건 두 가지다.
 *  ① **안 옮긴 것**을 잡는다 — 이 레포의 이식 실패는 "잘못 옮김"보다
 *     "안 옮김"이 압도적이고, 타입·테스트는 존재하는 코드만 본다.
 *  ② web 과 **같아야 하는 상수**를 web 파일에서 직접 읽어 대조한다 — web 이
 *     바뀌면 이 테스트가 깨져서 알려준다(trending-screen.test.ts 와 같은 방식).
 *
 * ⚠️`import from 'fs'` 는 쓰지 않는다(@types/node 가 없어 tsc 가 죽는다).
 */
const fs = require('fs');
const path = require('path');

declare const __dirname: string;

const read = (p: string) =>
  fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const web = (p: string) =>
  fs.readFileSync(path.join(__dirname, '../../web/src', p), 'utf8');

// ── 앱 ──
const shell = read('src/screens/detail/SearchScreen.tsx');
const screen = read('src/screens/search/SearchScreen.tsx');
const header = read('src/screens/search/ui/SearchHeader.tsx');
const initial = read('src/screens/search/ui/SearchInitial.tsx');
const results = read('src/screens/search/ui/SearchResults.tsx');
const filterBar = read('src/screens/search/ui/SearchFilterBar.tsx');
const notFound = read('src/screens/search/ui/SearchNotFound.tsx');
const suggestionList = read('src/screens/search/ui/SuggestionList.tsx');
const recentUi = read('src/screens/search/ui/RecentKeywords.tsx');
const recommendedUi = read('src/screens/search/ui/RecommendedKeywords.tsx');
const filters = read('src/entities/search/model/filters.ts');
const queries = read('src/entities/search/api/search.queries.ts');
const gqlDoc = read('src/graphql/search.ts');
const recentLib = read('src/features/search/lib/recent-keywords.ts');
const suggestionsModel = read(
  'src/features/search/model/useSearchSuggestions.ts',
);
const navigator = read('src/navigations/tab/SearchStackNavigator.tsx');
const tabStack = read('src/navigations/tab/TabStackNavigator.tsx');
const navTypes = read('src/navigations/tab/types.ts');

const appSources = [
  screen,
  header,
  initial,
  results,
  filterBar,
  notFound,
  suggestionList,
  recentUi,
  recommendedUi,
];

/**
 * 부정 검사(`not.toContain`)는 **주석을 지운 코드**에만 한다.
 * 주석에 그 낱말이 있으면 거짓 양성이 난다 — 런북에 적힌 함정이고 이 테스트를
 * 쓰면서 실제로 5건 걸렸다("StackWebView 를 지웠다"는 주석이 그 검사를 깨뜨렸다).
 */
function code(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

const appCode = appSources.map(code);

// ── web ──
const webInput = web('widgets/search/ui/SearchInput.tsx');
const webInputVm = web('widgets/search/hooks/useSearchInputViewModel.ts');
const webInitial = web('widgets/search/ui/InitialResult.tsx');
const webResult = web('widgets/search/ui/SearchResult.tsx');
const webFilterBar = web('widgets/search/ui/SearchFilterBar.tsx');
const webFilters = web('widgets/search/hooks/useSearchFilters.ts');
const webListVm = web('widgets/search/hooks/useProductListViewModel.ts');
const webAutocomplete = web(
  'widgets/search/hooks/useSearchAutocompleteViewModel.ts',
);
const webRecent = web('widgets/search/ui/RecentKeywords.tsx');
const webRecommend = web('widgets/search/ui/RecommendationKeywords.tsx');
const webNotFound = web('widgets/search/ui/ProductNotFound.tsx');
const webCardTracking = web('entities/product-list/model/card-tracking.ts');

/** `[...]` 안의 따옴표 문자열을 순서대로 뽑는다. */
function stringsInArray(source: string, marker: string): string[] {
  const start = source.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  const open = source.indexOf('[', start);
  const close = source.indexOf(']', open);
  return (source.slice(open, close).match(/'([^']*)'/g) ?? []).map(s =>
    s.slice(1, -1),
  );
}

/** `key: '값'` 쌍을 블록에서 순서대로 뽑는다. */
function labelPairs(source: string, marker: string): [string, string][] {
  const start = source.indexOf(marker);
  expect(start).toBeGreaterThan(-1);
  const open = source.indexOf('{', start);
  const close = source.indexOf('};', open);
  const block = source.slice(open, close);
  return (block.match(/'?[\w-]+'?:\s*'[^']*'/g) ?? []).map(entry => {
    const [rawKey, rawValue] = entry.split(/:\s*/);
    return [rawKey.replace(/'/g, ''), rawValue.slice(1, -1)] as [
      string,
      string,
    ];
  });
}

describe('껍데기 교체 — 검색 본문이 더 이상 웹뷰가 아니다', () => {
  it('검색 루트에서 StackWebView 가 사라졌다', () => {
    expect(code(shell)).not.toContain('StackWebView');
    expect(code(shell)).not.toContain('path="/search"');
    expect(shell).toContain('NativeSearchScreen');
  });

  it('라우트 배선은 그대로 — 네비게이터는 같은 경로를 import 한다', () => {
    // 껍데기를 지우거나 옮기면 검색 스택이 통째로 깨진다.
    expect(navigator).toContain("from '@/screens/detail/SearchScreen'");
    expect(navigator).toContain('searchStackNavigations.HOME');
  });

  it('검색 스택은 헤더를 화면에 맡긴다(headerShown: false)', () => {
    // 네비게이터가 헤더를 켜면 뒤로가기·입력창이 두 겹이 된다.
    expect(navigator).toContain('headerShown: false');
    expect(header).toContain('SEARCH_HEADER_HEIGHT = 56');
    expect(header).toContain('accessibilityLabel="뒤로"');
  });

  it('탭바 숨김은 라우트가 이미 판정한다 — 화면이 useHideTabBar 를 또 걸지 않는다', () => {
    // 화면별 훅은 focus/cleanup 순서로 카운터가 새서 탭바가 안 돌아오던 원인이다.
    expect(tabStack).toContain('routeName === tabStackNavigations.SEARCH');
    expect(code(screen)).not.toContain('useHideTabBar(');
    // 대신 iOS26 clip 만큼 하단을 비운다(웹뷰 시절 잘림 버그와 같은 처방).
    expect(screen).toContain('useHiddenTabBarClipPadding()');
  });
});

describe('딥링크 keyword 인수', () => {
  it('라우트 파라미터의 keyword 로 시작한다', () => {
    expect(navTypes).toContain('{keyword?: string} | undefined');
    expect(screen).toContain('route.params?.keyword');
  });

  it('딥링크로 들어온 검색어도 최근 검색어에 남는다(web 과 같은 규칙)', () => {
    // web 은 searchParams 가 바뀔 때마다 setRecentKeyord 를 부른다.
    expect(webInputVm).toContain("setRecentKeyord(keyword ? keyword : '')");
    expect(screen).toContain('if (initialKeyword) recent.push(initialKeyword)');
  });

  it('결과를 들고 진입하면 자동 포커스를 주지 않는다', () => {
    // web 운영 실측: 포커스 → 제안어가 결과·필터를 가리고 키보드가 올라온다.
    expect(webInput).toContain('autoFocus={!keyword}');
    expect(screen).toContain('autoFocus={!initialKeyword}');
  });
});

describe('web 과 같아야 하는 상수', () => {
  it('추천 검색어 목록이 글자까지 같다', () => {
    const webKeywords = stringsInArray(webRecommend, 'const KEYWORDS');
    const appKeywords = stringsInArray(
      recommendedUi,
      'export const RECOMMENDED_KEYWORDS',
    );
    expect(webKeywords).toHaveLength(25);
    expect(appKeywords).toEqual(webKeywords);
  });

  it('추천 검색어는 5개만 보여준다', () => {
    expect(webRecommend).toContain('.slice(0, 5)');
    expect(recommendedUi).toContain('RECOMMENDED_KEYWORD_COUNT = 5');
  });

  it('정렬 라벨이 같다', () => {
    expect(labelPairs(filters, 'export const SORT_LABELS')).toEqual(
      labelPairs(webFilterBar, 'const SORT_LABELS'),
    );
  });

  it('기간 라벨이 같다', () => {
    expect(labelPairs(filters, 'export const PERIOD_LABELS')).toEqual(
      labelPairs(webFilterBar, 'const PERIOD_LABELS'),
    );
  });

  it('정렬·기간 후보값이 같다', () => {
    expect(stringsInArray(filters, 'export const SEARCH_SORTS')).toEqual(
      stringsInArray(webFilters, 'export const SEARCH_SORTS'),
    );
    expect(stringsInArray(filters, 'export const SEARCH_PERIODS')).toEqual(
      stringsInArray(webFilters, 'export const SEARCH_PERIODS'),
    );
  });

  it('기간 구간이 web PERIOD_HOURS 와 같은 길이다(시간 → 일)', () => {
    expect(webListVm).toContain(
      "const PERIOD_HOURS = { '1d': 24, '7d': 24 * 7, '30d': 24 * 30 }",
    );
    expect(filters).toContain("'1d': 1");
    expect(filters).toContain("'7d': 7");
    expect(filters).toContain("'30d': 30");
  });

  it('한 페이지 20개', () => {
    expect(webListVm).toContain('const limit = 20');
    expect(queries).toContain('SEARCH_LIMIT = 20');
  });

  it('최근 검색어 10개', () => {
    expect(webInputVm).toContain('RECENT_KEYWORDS_LIMIT = 10');
    expect(recentLib).toContain('RECENT_KEYWORDS_LIMIT = 10');
  });

  it('자동완성 최소 길이·개수가 같다', () => {
    expect(webAutocomplete).toContain('MIN_PREFIX_LENGTH_KOREAN = 1');
    expect(webAutocomplete).toContain('MIN_PREFIX_LENGTH_OTHER = 2');
    expect(webAutocomplete).toContain('SUGGESTION_LIMIT = 10');
    expect(suggestionsModel).toContain('MIN_PREFIX_LENGTH_KOREAN = 1');
    expect(suggestionsModel).toContain('MIN_PREFIX_LENGTH_OTHER = 2');
    expect(queries).toContain('SUGGESTION_LIMIT = 10');
  });

  it('총량 표기 캡이 같다(Meili 5000)', () => {
    expect(webResult).toContain('estimatedTotal >= 5000');
    expect(results).toContain('ESTIMATED_TOTAL_CAP = 5000');
  });

  it('노출·클릭 출처 문자열이 web 과 같다 — 백엔드 집계가 이 값으로 필터한다', () => {
    expect(webCardTracking).toContain("| 'search'");
    expect(results).toContain("SEARCH_SOURCE = 'search'");
    expect(results).toContain('useRankingImpressionTracker(SEARCH_SOURCE)');
  });

  it('빈 상태 문구가 web 과 같다', () => {
    expect(webNotFound).toContain('검색 결과가 없어요');
    expect(webNotFound).toContain('키워드를 등록하고 알림을 받아보세요');
    expect(notFound).toContain('검색 결과가 없어요');
    expect(notFound).toContain('키워드를 등록하고 알림을 받아보세요');
    // 필터 때문에 0건인 경우는 문구가 다르다(풀 수 있는 필터가 있다).
    expect(webResult).toContain('선택한 필터에 맞는 결과가 없어요.');
    expect(results).toContain('선택한 필터에 맞는 결과가 없어요.');
  });

  it('입력창 placeholder 가 같다', () => {
    expect(webInput).toContain('placeholder="핫딜 제품을 검색해 주세요"');
    expect(header).toContain('placeholder="핫딜 제품을 검색해 주세요"');
  });
});

describe('쿼리 변수 — web 이 실제로 보내는 것과 같다', () => {
  it('검색 쿼리가 필터 6종을 다 보낸다', () => {
    for (const variable of [
      'keyword',
      'categoryIds',
      'providerIds',
      'startDate',
      'isEnd',
      'orderBy',
    ]) {
      expect(gqlDoc).toContain(`$${variable}`);
      expect(queries).toContain(variable);
    }
    // 커서 페이지네이션
    expect(gqlDoc).toContain('$searchAfter');
    expect(queries).toContain('searchAfter: pageParam');
  });

  it('총량(estimatedTotal)을 결과에서 읽는다 — 홈 쿼리엔 없는 필드다', () => {
    expect(gqlDoc).toContain('estimatedTotal');
    expect(code(read('src/graphql/home.ts'))).not.toContain('estimatedTotal');
    expect(results).toContain('products[0]?.estimatedTotal');
  });

  it('정렬은 web 과 같은 3종 — recent 는 orderBy 를 안 보낸다', () => {
    // ⚠️keyword 가 있으면 orderBy 5종이 무시된다(2026-08-10 실측). web 이
    // 실제로 보내는 값만 옮겨야 "정렬이 안 먹는" 항목을 새로 만들지 않는다.
    expect(webListVm).toContain('ProductOrderType.Relevance');
    expect(webListVm).toContain('ProductOrderType.CommentCount');
    expect(queries).toContain('ProductOrderType.Relevance');
    expect(queries).toContain('ProductOrderType.CommentCount');
    expect(queries).toMatch(/return undefined;\s*}/);
  });

  it('품절 포함은 ON 일 때만 isEnd: true (web 과 같은 의미)', () => {
    expect(webListVm).toContain('isEnd: filters.ended ? true : undefined');
    expect(queries).toContain('isEnd: filters.ended ? true : undefined');
  });

  it('새 검색은 필터·정렬을 리셋한다(web 2026-07-22 결정 6A)', () => {
    expect(webInputVm).toContain('필터·정렬 리셋은 의도된 동작');
    expect(screen).toContain('resetFilters()');
  });

  it('필터의 카테고리는 선호가 아니라 전체다', () => {
    // 발견 탭은 categoriesForUser(선호)지만 검색은 전체여야 필터가 쓸모 있다.
    expect(webFilterBar).toContain('CategoryQueries.categories()');
    expect(queries).toContain('CategoryService.getCategories()');
    expect(code(queries)).not.toContain('categoriesForUser');
  });
});

describe('안 옮긴 것 — 도달 불가/불필요를 못박는다', () => {
  it('데스크톱 레이아웃은 옮기지 않는다', () => {
    // 앱엔 PC 뷰포트가 없다. web DesktopSearchLayout 은 grid-cols-12 전용.
    for (const source of appCode) {
      expect(source).not.toContain('DesktopSearchLayout');
      expect(source).not.toContain('pc:');
    }
  });

  it('애드센스 인피드 광고는 옮기지 않는다(네이티브 AdSense 가 없다)', () => {
    expect(webResult).toContain('SearchInFeedAd');
    for (const source of appCode) {
      expect(source).not.toContain('SearchInFeedAd');
      expect(source).not.toContain('adsense');
    }
  });

  it('비로그인 게이트·keyword_intent 는 앱에서 도달 불가다', () => {
    // RootNavigator 가 앱 전체를 로그인 뒤에 둔다 → 옮기면 0건짜리 죽은 코드.
    expect(webNotFound).toContain('useRedirectIfNotLoggedIn');
    expect(webNotFound).toContain('keyword_intent');
    for (const source of appCode) {
      expect(source).not.toContain('useRedirectIfNotLoggedIn');
      expect(source).not.toContain('keyword_intent');
    }
  });

  it('★search_no_result 는 인수했다 — GTM 이 닿지 않아 그냥 두면 사라진다', () => {
    // web 은 dataLayer → GTM 으로 보내는데 네이티브엔 GTM DOM 트리거가 안 닿는다.
    // ⚠️수단은 2026-09-08 에 Mixpanel → GA4(Firebase Analytics) 로 바뀌었다.
    // 여기서 검사하는 건 **이벤트가 앱에서도 나간다**는 사실이고, 보내는 SDK 는
    // `shared/lib/analytics` 한 곳이 정한다.
    expect(webNotFound).toContain("event: 'search_no_result'");
    expect(notFound).toContain("Analytics.track('search_no_result'");
    expect(notFound).toContain("from '@/shared/lib/analytics/ga4'");
  });

  it('스크롤로 검색바 숨기기(useInputHideOnScroll)는 남긴 이유가 적혀 있다', () => {
    // 앱 헤더는 화면 밖 고정이라 목록을 가리지 않는다. 옮기려면 공용
    // CurationGrid 에 onScroll 을 뚫어야 한다 — 이번 범위 밖.
    expect(header).toContain('useInputHideOnScroll');
    expect(code(screen)).not.toContain('useInputHideOnScroll');
  });

  it('최근 검색어의 "검색 내역이 없어요."는 web 에서도 도달 불가라 안 옮겼다', () => {
    // web 은 keywords.length > 0 일 때만 섹션을 그린다 → 그 안의 빈 문구는 죽은 코드.
    expect(webRecent).toContain('검색 내역이 없어요.');
    expect(recentUi).toContain('if (keywords.length === 0) return null;');
    expect(code(recentUi)).not.toContain('검색 내역이 없어요');
  });

  it('키보드 방향키 탐색은 옮기지 않는다(모바일 키보드엔 방향키가 없다)', () => {
    expect(webInput).toContain("event.key === 'ArrowDown'");
    expect(code(suggestionList)).not.toContain('ArrowDown');
  });
});

describe('RN 함정 가드', () => {
  it('정규식으로 하이라이트하지 않는다', () => {
    // web HighlightText 는 new RegExp 라 'C++' 검색에서 흰 화면이 됐다.
    for (const source of [
      ...appCode,
      code(read('src/screens/search/lib/highlight.ts')),
    ]) {
      expect(source).not.toContain('new RegExp');
    }
  });

  it('PressableScale 에 크기 클래스를 주지 않는다', () => {
    // className 은 PressableScale 안쪽 View 가 받는다 → 바깥 폭이 0 이 되어
    // 통째로 안 보인다(이 레포에서 3번 재발).
    for (const source of appCode) {
      const uses = source.match(/<PressableScale[\s\S]*?>/g) ?? [];
      for (const tag of uses) {
        expect(tag).not.toMatch(/className="[^"]*\b(flex-1|w-full)\b/);
      }
    }
  });

  it('Animated 컴포넌트에 className 을 주지 않는다', () => {
    // NativeWind 4 는 Animated.* 의 className 을 조용히 무시한다.
    for (const source of appCode) {
      const tags = source.match(/<Animated\.[A-Za-z]+[\s\S]*?>/g) ?? [];
      for (const tag of tags) expect(tag).not.toContain('className=');
    }
  });

  it('회색 텍스트는 gray-500 이상을 쓴다(gray-400 은 WCAG AA 미달)', () => {
    for (const source of appCode) {
      expect(source).not.toContain('text-gray-400');
    }
  });

  it('제안어·목록에서 탭이 씹히지 않게 keyboardShouldPersistTaps 를 준다', () => {
    // 없으면 첫 탭이 키보드를 내리는 데만 쓰이고 선택이 무시된다.
    expect(suggestionList).toContain('keyboardShouldPersistTaps="handled"');
    expect(initial).toContain('keyboardShouldPersistTaps="handled"');
    expect(notFound).toContain('keyboardShouldPersistTaps="handled"');
  });

  it('제안어 목록은 본문의 형제로 마지막에 그린다(안드로이드 겹침)', () => {
    const bodyAt = screen.indexOf('<SearchInitial');
    const suggestionsAt = screen.indexOf('<SuggestionList');
    expect(bodyAt).toBeGreaterThan(-1);
    expect(suggestionsAt).toBeGreaterThan(bodyAt);
  });
});

describe('재사용 — 목록·카드를 새로 만들지 않았다', () => {
  it('결과 그리드는 CurationGrid + GridCard 다', () => {
    expect(results).toContain("from '@/entities/home/ui/CurationGrid'");
    expect(results).toContain('GridCard');
    // 무한스크롤은 web 의 useInView 센티넬 대신 onEndReached.
    expect(webListVm).toContain('useInView');
    expect(results).toContain('onEndReached');
  });

  it('추천 핫딜 캐러셀은 발견 탭과 같은 쿼리를 쓴다', () => {
    // web 도 검색 초기화면과 발견 탭이 communityRandomRankingProducts 를 공유한다.
    expect(webInitial).toContain('useHotDealsRandom');
    expect(initial).toContain('TrendingQueries.recommended()');
    expect(notFound).toContain('TrendingQueries.recommended()');
  });

  it('필터 전환 중 목록이 비지 않는다(keepPreviousData)', () => {
    expect(webListVm).toContain('placeholderData: keepPreviousData');
    expect(queries).toContain('placeholderData: keepPreviousData');
    expect(results).toContain('isPlaceholderData');
  });
});
