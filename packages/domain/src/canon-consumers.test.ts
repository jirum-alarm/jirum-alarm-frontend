import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

/**
 * «web·앱이 둘 다 정본을 쓰나» — 화면 짝 맞춤의 정본을 두 앱이 실제로 import 하는지 본다.
 *
 * 전엔 앱 테스트가 web 의 특정 파일 경로를 열어 문자열을 대조했다(mypage-port-parity 등). 그 방식은
 * 파일을 옮기는 리팩터링마다 깨졌다(FSD 정리 10/19 등). 여기선 **경로가 아니라 import 를** 본다 —
 * 두 앱 소스 어딘가에서 정본을 import 하면 통과, 한쪽이 정본을 버리고 다시 만들면 실패.
 * 같은 이름으로 다시 정의하는 건 no-app-copies.test 가 막는다.
 *
 * 새 화면 정본을 만들면 여기 한 줄 추가한다(모듈 → 두 앱이 써야 하는 이름들).
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../..');

const SHARED_BY_BOTH: Record<string, string[]> = {
  mypage: [
    'MYPAGE_GROUPS',
    'CUSTOMER_SERVICE_TITLE',
    'MAX_KEYWORD_COUNT',
    'WISHLIST_PAGE_SIZE',
    'ACCOUNT_COPY',
    'THEME_COPY',
    'themeSubscriberLabel',
    'POLICY_DOCS',
  ],
  'keyword-options': ['KEYWORD_ALERT_LABELS', 'KEYWORD_DEAL_CHOICES', 'summarizeKeywordAlert'],
  'price-chart': ['buildChartGeometry', 'shortWon', 'won', 'PRICE_PREVIEW_HINT'],
  'guide-content': ['parseGuideContent'],
  'badge-explain': ['TOSS_BADGE_EXPLAIN', 'END_BADGE_EXPLAIN'],
  'product-card': ['visibleHotDealType'],
  ranking: [
    'rankingWindowDays',
    'orderTrendingCategories',
    'nextTrendingView',
    'RANKING_CARD_SOURCE',
    'TRENDING_VIEW_TABS',
    'trendingTabView',
    'HOT_FEED_COPY',
    'HOT_FEED_PAGE_SIZE',
    'HOT_FEED_CARD_SOURCE',
  ],
  share: ['SHARE_CHANNEL_COPY'],
  alarm: ['ALARM_COPY'],
  'community-post': [
    'parsePostContent',
    'isAllowedPostImageUrl',
    'MAX_POST_IMAGES',
    'getPostDisplayContent',
  ],
  image: ['convertToWebp'],
  'go-back': ['NATIVE_STACK_DATASET_KEY'],
  community: [
    'REPORT_REASON_OPTIONS',
    'COMMUNITY_COPY',
    'COMMUNITY_TABS',
    'isNewNotice',
    'communityTabFilter',
    'COMMUNITY_POSTS_PAGE_SIZE',
    'COMMUNITY_POSTS_ORDER',
    'COMMUNITY_HOT_DEAL_OPTIONS',
    'dailyHotDealOptionIndex',
  ],
  price: ['parsePrice', 'splitPriceNote'],
  'keyword-hub': [
    'KEYWORD_PROMPT_EVENT',
    'buildKeywordHubLead',
    'describeKeywordHubRhythm',
    'KEYWORD_HUB_MIN_DEALS',
  ],
  'hub-model-pages': ['buildHubModelGroups'],
  categories: ['INTEREST_CATEGORIES', 'MAX_INTEREST_CATEGORIES'],
  'color-scheme': ['COLOR_SCHEME_COOKIE'],
  'home-sections': [
    'mapHomePageSections',
    'buildFallbackPromotionSections',
    'findPromotionSectionById',
    'LIST_SECTION_MAX',
    'CURATION_PAGE_SIZE',
  ],
  toss: [
    'TOSS_SECTION_KEYWORD',
    'TOSS_HOME_SECTION_IDS',
    'toTossDeal',
    'stripPriceFromTitle',
    'isPriceGuideTitle',
    'tossCornerPath',
  ],
  search: [
    'SEARCH_SORTS',
    'SEARCH_PERIODS',
    'SORT_LABELS',
    'PERIOD_LABELS',
    'periodStartDate',
    'hasActiveSearchFilters',
    'isPrefixValid',
    'SEARCH_PAGE_SIZE',
    'RECENT_KEYWORDS_LIMIT',
    'RECOMMENDED_KEYWORD_COUNT',
    'SUGGESTION_LIMIT',
    'ESTIMATED_TOTAL_CAP',
    'SEARCH_COPY',
    'searchFilterVariables',
    'searchOrderBy',
    'endedRescueVariables',
    'SEARCH_EVENT',
    'SEARCH_ALERT_BAR_COPY',
    'SEARCH_BAR_SOURCE',
  ],
};

const walk = (dir: string, out: string[] = []): string[] => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(e.name) && !/\.(test|spec|stories)\.tsx?$/.test(e.name))
      out.push(p);
  }
  return out;
};

/** 앱 소스에서 `@jirum/domain/<모듈>` 로부터 가져오는(또는 다시 내보내는) 이름들. */
const importedNames = (appRoot: string) => {
  const byModule = new Map<string, Set<string>>();
  for (const file of walk(path.join(repo, appRoot))) {
    const src = fs.readFileSync(file, 'utf8');
    for (const m of src.matchAll(
      /(?:import|export)\s*(?:type\s*)?\{([^}]*)\}\s*from\s*'@jirum\/domain\/([\w-]+)'/g,
    )) {
      const names = byModule.get(m[2]) ?? new Set<string>();
      for (const part of m[1].split(',')) {
        const name = part
          .trim()
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0];
        if (name) names.add(name);
      }
      byModule.set(m[2], names);
    }
  }
  return byModule;
};

for (const app of ['apps/web/src', 'apps/mobile/src']) {
  test(`${app} 가 화면 정본을 import 한다`, () => {
    const imported = importedNames(app);
    const missing = Object.entries(SHARED_BY_BOTH).flatMap(([mod, names]) =>
      names.filter((n) => !imported.get(mod)?.has(n)).map((n) => `@jirum/domain/${mod} ${n}`),
    );
    assert.deepEqual(
      missing,
      [],
      `${app} 가 정본을 쓰지 않는다(다시 만들었나?):\n${missing.join('\n')}`,
    );
  });
}
